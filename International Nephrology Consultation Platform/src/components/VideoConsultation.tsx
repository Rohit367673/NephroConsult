import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Video, Mic, MicOff, VideoOff, Phone, PhoneOff, Settings, Monitor, Volume2, AlertCircle, CheckCircle, Clock, Users } from 'lucide-react';

export const VideoConsultation: React.FC = () => {
  const [isPreCallOpen, setIsPreCallOpen] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [useBuiltIn, setUseBuiltIn] = useState(true);
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const [deviceChecks, setDeviceChecks] = useState({
    camera: false,
    microphone: false,
    connection: false
  });

  useEffect(() => {
    if (isPreCallOpen) {
      // Simulate device checks
      const checkDevices = async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setDeviceChecks(prev => ({ ...prev, camera: true }));
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        setDeviceChecks(prev => ({ ...prev, microphone: true }));
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        setDeviceChecks(prev => ({ ...prev, connection: true }));
      };
      
      checkDevices();
    }
  }, [isPreCallOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPreCallOpen && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isPreCallOpen, countdown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const DeviceCheckItem = ({ icon: Icon, label, status }: { icon: any, label: string, status: boolean }) => (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
      <Icon className="w-5 h-5 text-[#006f6f]" />
      <span className="flex-1 text-gray-700">{label}</span>
      {status ? (
        <CheckCircle className="w-5 h-5 text-green-600" />
      ) : (
        <div className="w-5 h-5 border-2 border-gray-300 rounded-full animate-pulse" />
      )}
    </div>
  );

  return (
    <section className="py-20">
      <div className="container-medical">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Video Consultation Platform</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience seamless, secure video consultations with built-in WebRTC technology 
            or connect via external platforms like Zoom.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Platform Options */}
          <div className="space-y-8">
            <Card className="p-6 rounded-2xl shadow-lg border-gray-200">
              <CardContent className="p-0">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Consultation Options</h3>
                  <Badge className="bg-[#dcfce7] text-[#166534]">Available Now</Badge>
                </div>

                <div className="space-y-4">
                  {/* Built-in WebRTC Option */}
                  <div className={`p-4 border-2 rounded-xl transition-all cursor-pointer ${
                    useBuiltIn ? 'border-[#006f6f] bg-[#006f6f]/5' : 'border-gray-200 hover:border-gray-300'
                  }`} onClick={() => setUseBuiltIn(true)}>
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        useBuiltIn ? 'bg-[#006f6f]' : 'bg-gray-100'
                      }`}>
                        <Monitor className={`w-6 h-6 ${useBuiltIn ? 'text-white' : 'text-[#006f6f]'}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">Built-in Video Call</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Secure, browser-based video consultation with no downloads required
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">No Download</span>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">Screen Share</span>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">Recording</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Zoom Option */}
                  <div className={`p-4 border-2 rounded-xl transition-all cursor-pointer ${
                    !useBuiltIn ? 'border-[#006f6f] bg-[#006f6f]/5' : 'border-gray-200 hover:border-gray-300'
                  }`} onClick={() => setUseBuiltIn(false)}>
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        !useBuiltIn ? 'bg-[#006f6f]' : 'bg-gray-100'
                      }`}>
                        <Video className={`w-6 h-6 ${!useBuiltIn ? 'text-white' : 'text-[#006f6f]'}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">External Platform (Zoom)</h4>
                        <p className="text-sm text-gray-600 mb-2">
                          Join via Zoom for familiar interface and advanced features
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">Familiar Interface</span>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">Mobile App</span>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">Waiting Room</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Use platform preference</span>
                    <Switch
                      checked={useBuiltIn}
                      onCheckedChange={setUseBuiltIn}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features Comparison */}
            <Card className="p-6 rounded-2xl shadow-lg border-gray-200">
              <CardContent className="p-0">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Platform Features</h3>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="font-medium text-gray-700">Feature</div>
                    <div className="font-medium text-gray-700 text-center">Built-in</div>
                    <div className="font-medium text-gray-700 text-center">Zoom</div>
                  </div>
                  
                  {[
                    { feature: 'HD Video Quality', builtin: true, zoom: true },
                    { feature: 'Screen Sharing', builtin: true, zoom: true },
                    { feature: 'No Download Required', builtin: true, zoom: false },
                    { feature: 'Mobile App Support', builtin: false, zoom: true },
                    { feature: 'Waiting Room', builtin: false, zoom: true },
                    { feature: 'Session Recording', builtin: true, zoom: true },
                    { feature: 'Chat Messaging', builtin: true, zoom: true },
                    { feature: 'Bandwidth Optimization', builtin: true, zoom: true }
                  ].map((item, index) => (
                    <div key={index} className="grid grid-cols-3 gap-4 text-sm py-2 border-t border-gray-100">
                      <div className="text-gray-700">{item.feature}</div>
                      <div className="text-center">
                        {item.builtin ? (
                          <CheckCircle className="w-4 h-4 text-green-600 mx-auto" />
                        ) : (
                          <div className="w-4 h-4 bg-gray-200 rounded mx-auto"></div>
                        )}
                      </div>
                      <div className="text-center">
                        {item.zoom ? (
                          <CheckCircle className="w-4 h-4 text-green-600 mx-auto" />
                        ) : (
                          <div className="w-4 h-4 bg-gray-200 rounded mx-auto"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Join Session Interface */}
          <div className="space-y-8">
            <Card className="p-6 rounded-2xl shadow-lg border-gray-200">
              <CardContent className="p-0">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Your Next Appointment</h3>
                  <div className="inline-flex items-center space-x-2 bg-[#dcfce7] px-3 py-1 rounded-full">
                    <Clock className="w-4 h-4 text-[#166534]" />
                    <span className="text-sm font-medium text-[#166534]">
                      Starts in {formatTime(countdown)}
                    </span>
                  </div>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Patient:</span>
                    <span className="font-medium">John Smith</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">Today, 2:30 PM EST</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">45 minutes</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">Follow-up Consultation</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button
                    onClick={() => setIsPreCallOpen(true)}
                    className="w-full bg-[#006f6f] hover:bg-[#005555] text-white py-3 rounded-xl"
                    disabled={countdown > 300}
                  >
                    <Video className="w-5 h-5 mr-2" />
                    {countdown > 300 ? 'Join Available Soon' : 'Start Consultation'}
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full border-[#006f6f] text-[#006f6f] hover:bg-[#006f6f]/5 py-3 rounded-xl"
                  >
                    <Settings className="w-5 h-5 mr-2" />
                    Test Camera & Microphone
                  </Button>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      <Users className="w-4 h-4 mr-1" />
                      Patient Info
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      <AlertCircle className="w-4 h-4 mr-1" />
                      Emergency Contact
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technical Requirements */}
            <Card className="p-6 rounded-2xl shadow-sm border-gray-200">
              <CardContent className="p-0">
                <h4 className="font-semibold text-gray-900 mb-4">Technical Requirements</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">Chrome 80+ or Firefox 75+</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">Stable internet (2+ Mbps)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">Camera and microphone access</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-gray-700">Quiet, private environment</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Pre-call Check Modal */}
      {isPreCallOpen && (
        <Dialog open={isPreCallOpen} onOpenChange={setIsPreCallOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Pre-call System Check</DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              {/* Device Preview */}
              <div className="bg-gray-900 rounded-xl p-6 text-center">
                <div className="w-full h-48 bg-gray-800 rounded-lg flex items-center justify-center mb-4">
                  {cameraEnabled ? (
                    <div className="text-white">
                      <Video className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm">Camera Preview</p>
                    </div>
                  ) : (
                    <div className="text-gray-400">
                      <VideoOff className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm">Camera Disabled</p>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-center space-x-4">
                  <Button
                    variant={cameraEnabled ? "default" : "secondary"}
                    size="sm"
                    onClick={() => setCameraEnabled(!cameraEnabled)}
                    className={cameraEnabled ? "bg-white text-gray-900 hover:bg-gray-100" : ""}
                  >
                    {cameraEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant={micEnabled ? "default" : "secondary"}
                    size="sm"
                    onClick={() => setMicEnabled(!micEnabled)}
                    className={micEnabled ? "bg-white text-gray-900 hover:bg-gray-100" : ""}
                  >
                    {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Device Checks */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">System Check</h4>
                <DeviceCheckItem icon={Video} label="Camera Test" status={deviceChecks.camera} />
                <DeviceCheckItem icon={Mic} label="Microphone Test" status={deviceChecks.microphone} />
                <DeviceCheckItem icon={Volume2} label="Connection Test" status={deviceChecks.connection} />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setIsPreCallOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setIsPreCallOpen(false);
                    setIsCallActive(true);
                  }}
                  disabled={!Object.values(deviceChecks).every(Boolean)}
                  className="flex-1 bg-[#006f6f] hover:bg-[#005555] text-white"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Join Consultation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </section>
  );
};