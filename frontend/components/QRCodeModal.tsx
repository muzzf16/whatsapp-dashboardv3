import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { socketService } from '@/lib/socket';
import { sessionAPI } from '@/lib/api';
import { QRCodeCanvas } from 'qrcode.react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QRCodeModal({ isOpen, onClose }: QRCodeModalProps) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');

  useEffect(() => {
    if (isOpen) {
      (async () => {
        // Connect to socket and wait until connected
        await socketService.connect();

        // Listen for QR code updates
        socketService.on('qr_update', (data) => {
          console.log('QR Code received:', data);
          setQrCode(data.qr);
          console.log('QR Code state updated:', data.qr);
          setSessionId(data.sessionId);
        });

        // Listen for connection updates
        socketService.on('connection_open', (data) => {
          console.log('Connection opened:', data);
          setConnectionStatus('connected');
          setTimeout(() => {
            onClose();
            setQrCode(null);
            setSessionId(null);
            setConnectionStatus('disconnected');
          }, 2000);
        });

        // Initialize a new session once connected
        try {
          const result = await sessionAPI.initSession();
          if (result.success) {
            console.log('Session initialized:', result);
            setConnectionStatus('connecting');
          } else {
            console.error('Failed to initialize session:', result.message);
            setConnectionStatus('disconnected');
          }
        } catch (error) {
          console.error('Error initializing session:', error);
          setConnectionStatus('disconnected');
        }
      })();

      return () => {
        socketService.off('qr_update');
        socketService.off('connection_open');
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Scan QR Code</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="flex flex-col items-center">
          {connectionStatus === 'connecting' && !qrCode && (
            <div className="py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Menyiapkan sesi baru...</p>
            </div>
          )}
          
          {qrCode && (
            <div className="mb-4">
              <div className="bg-white p-4 rounded border">
                <QRCodeCanvas value={qrCode || ''} size={256} />
              </div>
              <p className="mt-2 text-sm text-gray-600 text-center">
                Buka WhatsApp di ponsel Anda → Pengaturan → Perangkat Tertaut → Hubungkan Perangkat
              </p>
            </div>
          )}
          
          {connectionStatus === 'connected' && (
            <div className="py-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-1">Berhasil Terhubung!</h4>
              <p className="text-gray-600">Sesi WhatsApp telah berhasil dibuat.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}