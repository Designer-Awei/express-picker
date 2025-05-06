import React, { useState, useRef, useEffect } from 'react';
import { Modal, Button, message } from 'antd';
import { CameraOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { PendingDelivery, DeliveryRecord } from './PendingDeliverySection';

interface PickupCameraModalProps {
  visible: boolean;
  delivery: PendingDelivery | null;
  onCancel: () => void;
  onSuccess: (record: DeliveryRecord) => void;
}

/**
 * 拍照取件模态框组件
 * @param {boolean} visible - 是否可见
 * @param {PendingDelivery} delivery - 待取快递信息
 * @param {function} onCancel - 取消回调
 * @param {function} onSuccess - 成功回调
 * @returns {JSX.Element} 返回拍照取件模态框组件
 */
const PickupCameraModal: React.FC<PickupCameraModalProps> = ({
  visible,
  delivery,
  onCancel,
  onSuccess
}) => {
  const [step, setStep] = useState<'camera' | 'preview'>('camera');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // 初始化相机
  useEffect(() => {
    if (visible && step === 'camera') {
      initCamera();
    }
    
    // 组件卸载或模态框关闭时，释放相机资源
    return () => {
      releaseCamera();
    };
  }, [visible, step]);

  // 初始化相机
  const initCamera = async () => {
    try {
      const constraints = {
        video: { facingMode: 'environment', width: 1280, height: 720 }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        mediaStreamRef.current = stream;
        setCameraReady(true);
        setCameraError('');
      }
    } catch (err) {
      console.error('相机初始化失败:', err);
      setCameraError('无法访问相机，请确保已授予相机权限。');
      setCameraReady(false);
    }
  };

  // 释放相机资源
  const releaseCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
  };

  // 拍照
  const takePhoto = () => {
    if (!cameraReady || !videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    // 设置 canvas 尺寸与视频相同
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // 绘制视频帧到 canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // 将 canvas 转换为 base64 图片
    try {
      const imageDataUrl = canvas.toDataURL('image/jpeg');
      setPhotoUrl(imageDataUrl);
      setStep('preview');
    } catch (err) {
      console.error('生成照片失败:', err);
      message.error('拍照失败，请重试');
    }
  };

  // 重拍
  const retake = () => {
    setPhotoUrl('');
    setStep('camera');
  };

  // 确认取件
  const confirmPickup = () => {
    if (!delivery) return;
    
    // 创建取件记录
    const now = new Date();
    const formattedTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const record: DeliveryRecord = {
      id: delivery.id,
      location: delivery.location,
      pickupTime: formattedTime,
      photoUrl: photoUrl
    };
    
    // 直接调用成功回调，由父组件处理数据存储
    onSuccess(record);
    message.success('取件成功');
    
    // 重置状态
    setPhotoUrl('');
    setStep('camera');
  };

  // 取消并关闭
  const handleCancel = () => {
    setPhotoUrl('');
    setStep('camera');
    onCancel();
  };

  // 相机拍照界面
  const renderCameraView = () => (
    <div style={{ textAlign: 'center' }}>
      <div style={{ marginBottom: 16, padding: '0 24px' }}>
        <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
          请对准快递条形码拍摄
        </div>
        <div style={{ color: '#888', fontSize: 14 }}>
          取件码: {delivery?.id} | 区域: {delivery?.location}
        </div>
      </div>
      
      {cameraError ? (
        <div style={{ color: 'red', padding: 20 }}>{cameraError}</div>
      ) : (
        <div style={{ position: 'relative' }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{ width: '100%', maxHeight: '60vh', background: '#000' }}
          />
          <div 
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '90%',
              height: '80%',
              border: '2px dashed #fff',
              borderRadius: '8px',
              boxShadow: '0 0 0 1000px rgba(0,0,0,0.3)',
              pointerEvents: 'none'
            }}
          />
        </div>
      )}
      
      <div style={{ marginTop: 16 }}>
        <Button
          type="primary"
          shape="circle"
          icon={<CameraOutlined />}
          size="large"
          onClick={takePhoto}
          disabled={!cameraReady}
          style={{ width: 64, height: 64, fontSize: 24 }}
        />
      </div>
      
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );

  // 预览确认界面
  const renderPreviewView = () => (
    <div style={{ textAlign: 'center' }}>
      <div style={{ marginBottom: 16, padding: '0 24px' }}>
        <div style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>
          确认取件照片
        </div>
        <div style={{ color: '#888', fontSize: 14 }}>
          取件码: {delivery?.id} | 区域: {delivery?.location}
        </div>
      </div>
      
      <div style={{ padding: '0 20px' }}>
        <img 
          src={photoUrl} 
          alt="取件照片" 
          style={{ 
            width: '100%', 
            maxHeight: '60vh', 
            objectFit: 'contain',
            border: '1px solid #f0f0f0',
            borderRadius: '4px'
          }} 
        />
      </div>
      
      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 16 }}>
        <Button
          danger
          shape="circle"
          icon={<CloseOutlined />}
          size="large"
          onClick={retake}
          style={{ width: 48, height: 48 }}
        />
        <Button
          type="primary"
          shape="circle"
          icon={<CheckOutlined />}
          size="large"
          onClick={confirmPickup}
          style={{ width: 48, height: 48 }}
        />
      </div>
    </div>
  );

  return (
    <Modal
      title="拍照取件"
      open={visible}
      onCancel={handleCancel}
      footer={null}
      destroyOnClose
      centered
      maskClosable={false}
      closable={step === 'camera'}
      width={400}
      bodyStyle={{ padding: 0, paddingBottom: 24 }}
    >
      {step === 'camera' ? renderCameraView() : renderPreviewView()}
    </Modal>
  );
};

export default PickupCameraModal; 