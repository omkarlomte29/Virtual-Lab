import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

const SubmissionFeedback = ({ submissionStatus, testResults }) => {
  if (!submissionStatus) return null;

  return (
    <div className="space-y-4 mt-4">
      {submissionStatus === "processing" ? (
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Processing submission...</span>
        </div>
      ) : (
        <div className="space-y-2">
          {testResults?.map((result, index) => (
            <Alert
              key={index}
              variant={result.status === "Accepted" ? "default" : "destructive"}
            >
              <AlertTitle>Test Case {index + 1}</AlertTitle>
              <AlertDescription>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold">Input:</p>
                    <pre className="mt-1 text-sm">{result.input}</pre>
                  </div>
                  <div>
                    <p className="font-semibold">Expected Output:</p>
                    <pre className="mt-1 text-sm">{result.expectedOutput}</pre>
                  </div>
                  <div>
                    <p className="font-semibold">Your Output:</p>
                    <pre className="mt-1 text-sm">{result.actualOutput}</pre>
                  </div>
                  <div>
                    <p className="font-semibold">Status:</p>
                    <span
                      className={
                        result.status === "Accepted"
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {result.status}
                    </span>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubmissionFeedback;
