import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { Play, CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import dataFlowTest from '../tests/dataFlowTest';

interface TestResult {
  testName: string;
  passed: boolean;
  details: string;
  data?: any;
}

export function TestRunner() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [showDetails, setShowDetails] = useState<{[key: string]: boolean}>({});

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);
    
    try {
      toast.info('🧪 Running comprehensive data flow tests...');
      const testResults = await dataFlowTest.runAllTests();
      setResults(testResults);
      
      const passedTests = testResults.filter(r => r.passed).length;
      const totalTests = testResults.length;
      const successRate = Math.round((passedTests / totalTests) * 100);
      
      if (successRate === 100) {
        toast.success(`🎉 All tests passed! (${passedTests}/${totalTests})`);
      } else {
        toast.warning(`⚠️ ${passedTests}/${totalTests} tests passed (${successRate}%)`);
      }
    } catch (error) {
      toast.error(`❌ Test execution failed: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const toggleDetails = (testName: string) => {
    setShowDetails(prev => ({
      ...prev,
      [testName]: !prev[testName]
    }));
  };

  const getStatusIcon = (passed: boolean) => {
    return passed ? (
      <CheckCircle2 className="w-5 h-5 text-green-600" />
    ) : (
      <XCircle className="w-5 h-5 text-red-600" />
    );
  };

  const getStatusBadge = (passed: boolean) => {
    return passed ? (
      <Badge className="bg-green-100 text-green-800 border-green-300">PASS</Badge>
    ) : (
      <Badge className="bg-red-100 text-red-800 border-red-300">FAIL</Badge>
    );
  };

  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;
  const successRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-[#006f6f]" />
              <span>Data Flow Test Suite</span>
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Comprehensive testing of data synchronization between patient and doctor systems
            </p>
          </div>
          <Button
            onClick={runTests}
            disabled={isRunning}
            className="bg-[#006f6f] hover:bg-[#005555]"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Tests
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Test Results Summary */}
        {results.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
              <div>
                <h3 className="font-semibold text-gray-900">Test Results Summary</h3>
                <p className="text-sm text-gray-600">
                  {passedTests}/{totalTests} tests passed ({successRate}% success rate)
                </p>
              </div>
              <div className="text-right">
                {successRate === 100 ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    <span className="font-semibold">All Tests Passed!</span>
                  </div>
                ) : (
                  <div className="flex items-center text-amber-600">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    <span className="font-semibold">Some Tests Failed</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Individual Test Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 mb-3">Detailed Test Results:</h3>
            
            {results.map((result, index) => (
              <div key={result.testName} className="border rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(result.passed)}
                    <h4 className="font-medium text-gray-900">
                      {index + 1}. {result.testName}
                    </h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(result.passed)}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleDetails(result.testName)}
                    >
                      {showDetails[result.testName] ? 'Hide' : 'Show'} Details
                    </Button>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">
                  {result.details}
                </p>
                
                {showDetails[result.testName] && result.data && (
                  <div className="mt-3 p-3 bg-gray-50 rounded border">
                    <h5 className="font-medium text-gray-900 mb-2">Test Data:</h5>
                    <Textarea
                      value={JSON.stringify(result.data, null, 2)}
                      readOnly
                      className="font-mono text-xs h-32"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Initial State */}
        {results.length === 0 && !isRunning && (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="font-medium text-gray-900 mb-2">Ready to Test Data Flow</h3>
            <p className="text-gray-600 mb-4">
              Click "Run Tests" to verify data synchronization between patient and doctor systems.
            </p>
            <div className="text-sm text-gray-500">
              <p>Tests will verify:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Meeting URL consistency between patient and doctor</li>
                <li>Consultation data synchronization</li>
                <li>Prescription flow from doctor to patient</li>
                <li>Patient document accessibility</li>
                <li>Real-time updates across systems</li>
                <li>Email notification functionality</li>
              </ul>
            </div>
          </div>
        )}

        {/* Running State */}
        {isRunning && (
          <div className="text-center py-8">
            <RefreshCw className="w-12 h-12 text-[#006f6f] mx-auto mb-4 animate-spin" />
            <h3 className="font-medium text-gray-900 mb-2">Running Tests...</h3>
            <p className="text-gray-600">
              Testing data flow between patient and doctor systems. This may take a few seconds.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default TestRunner;
