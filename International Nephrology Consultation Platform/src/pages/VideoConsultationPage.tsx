import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  MessageSquare,
  Settings,
  Monitor,
  Camera,
  Volume2,
  PhoneOff,
  Users,
  Clock,
  FileText,
  Send
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ChatMessage {
  id: string;
  sender: 'patient' | 'doctor';
  message: string;
  timestamp: Date;
}

export function VideoConsultationPage() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [consultationStarted, setConsultationStarted] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [consultationDuration, setConsultationDuration] = useState(0);

  // Mock appointment data
  const appointmentData = {
    id: appointmentId,
    patientName: 'John Doe',
    doctorName: 'Dr. Ilango S. Prakasam',
    scheduledTime: '10:00 AM',
    type: 'Video Consultation',
    duration: 30
  };

  useEffect(() => {
    // Simulate connection process
    const connectTimer = setTimeout(() => {
      setConnectionStatus('connected');
      setIsConnected(true);
      toast.success('Connected to video consultation');
    }, 3000);

    return () => clearTimeout(connectTimer);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (consultationStarted) {
      interval = setInterval(() => {
        setConsultationDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [consultationStarted]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartConsultation = () => {
    setConsultationStarted(true);
    toast.success('Consultation started');
  };

  const handleEndConsultation = () => {
    toast.success('Consultation ended');
    navigate('/patient/dashboard', {
      state: {
        message: 'Consultation completed successfully. You can find the consultation notes in your medical history.',
        consultationEnded: true
      }
    });
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    toast.info(isVideoOn ? 'Camera turned off' : 'Camera turned on');
  };

  const toggleAudio = () => {
    setIsAudioOn(!isAudioOn);
    toast.info(isAudioOn ? 'Microphone muted' : 'Microphone unmuted');
  };

  const sendChatMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: Date.now().toString(),
        sender: 'patient',
        message: newMessage.trim(),
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Simulate doctor response after 2 seconds
      setTimeout(() => {
        const doctorResponse: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'doctor',
          message: 'Thank you for the information. I will review this during our consultation.',
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, doctorResponse]);
      }, 2000);
    }
  };

  if (connectionStatus === 'connecting') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold mb-2">Connecting to Consultation</h2>
            <p className="text-gray-600 mb-4">
              Setting up your video consultation with {appointmentData.doctorName}
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>• Testing camera and microphone</p>
              <p>• Establishing secure connection</p>
              <p>• Joining consultation room</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-white font-medium">
                Consultation with {appointmentData.doctorName}
              </span>
            </div>
            {consultationStarted && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Clock className="h-3 w-3 mr-1" />
                {formatDuration(consultationDuration)}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="text-white border-gray-600">
              {appointmentData.scheduledTime}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowChat(!showChat)}
              className="text-white border-gray-600 hover:bg-gray-700"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main Video Area */}
        <div className="flex-1 relative">
          <div className="h-full flex items-center justify-center p-4">
            {/* Doctor Video (Main) */}
            <div className="relative w-full max-w-4xl aspect-video bg-gray-800 rounded-lg overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                {!consultationStarted ? (
                  <div className="text-center text-white">
                    <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold mb-2">Waiting for Doctor</h3>
                    <p className="text-gray-400 mb-6">
                      {appointmentData.doctorName} will join shortly
                    </p>
                    <Button onClick={handleStartConsultation}>
                      Start Consultation
                    </Button>
                  </div>
                ) : (
                  <div className="text-center text-white">
                    <div className="w-32 h-32 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-4xl font-bold text-white">DI</span>
                    </div>
                    <p className="font-semibold">{appointmentData.doctorName}</p>
                    <p className="text-sm text-gray-400">Nephrology Specialist</p>
                  </div>
                )}
              </div>
              
              {/* Doctor name overlay */}
              <div className="absolute bottom-4 left-4">
                <div className="bg-black/50 text-white px-3 py-1 rounded text-sm">
                  {appointmentData.doctorName}
                </div>
              </div>
            </div>

            {/* Patient Video (Picture-in-Picture) */}
            <div className="absolute bottom-4 right-4 w-48 aspect-video bg-gray-700 rounded-lg overflow-hidden border-2 border-gray-600">
              <div className="h-full flex items-center justify-center">
                {isVideoOn ? (
                  <div className="text-center text-white">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
                      <span className="text-lg font-bold text-white">
                        {appointmentData.patientName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400">
                    <VideoOff className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-xs">Camera Off</p>
                  </div>
                )}
              </div>
              
              <div className="absolute bottom-2 left-2">
                <div className="bg-black/50 text-white px-2 py-1 rounded text-xs">
                  You
                </div>
              </div>
            </div>
          </div>

          {/* Control Bar */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="bg-gray-800 rounded-full p-4 flex items-center space-x-4">
              <Button
                variant={isAudioOn ? "default" : "destructive"}
                size="lg"
                onClick={toggleAudio}
                className="rounded-full w-12 h-12 p-0"
              >
                {isAudioOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
              </Button>
              
              <Button
                variant={isVideoOn ? "default" : "destructive"}
                size="lg"
                onClick={toggleVideo}
                className="rounded-full w-12 h-12 p-0"
              >
                {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="rounded-full w-12 h-12 p-0 text-white border-gray-600"
              >
                <Monitor className="h-5 w-5" />
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="rounded-full w-12 h-12 p-0 text-white border-gray-600"
              >
                <Settings className="h-5 w-5" />
              </Button>
              
              <Button
                variant="destructive"
                size="lg"
                onClick={handleEndConsultation}
                className="rounded-full w-12 h-12 p-0"
              >
                <PhoneOff className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Consultation Chat</h3>
              <p className="text-sm text-gray-600">Send messages during consultation</p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2" />
                  <p>No messages yet</p>
                  <p className="text-sm">Send a message to start the conversation</p>
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'patient' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs p-3 rounded-lg ${
                      msg.sender === 'patient' 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm">{msg.message}</p>
                      <p className={`text-xs mt-1 ${
                        msg.sender === 'patient' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button onClick={sendChatMessage} size="sm">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}