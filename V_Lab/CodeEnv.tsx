import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Editor } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/hooks/use-toast";
import api from "../services/api";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import SubmissionFeedback from "@/components/SubmissionFeedback";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

const CodingEnvironmentPage = () => {
  const { practicalId } = useParams();
  const [courseName, setCourseName] = useState("");
  const [practicalName, setPracticalName] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [description, setDescription] = useState("");
  const [testCases, setTestCases] = useState([]);
  const [language, setLanguage] = useState("");
  const [languages, setLanguages] = useState([]);
  const [code, setCode] = useState("");
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [submissionStatus, setSubmissionStatus] = useState(null);
  // const [testResults, setTestResults] = useState([]);
  const [customInput, setCustomInput] = useState("");
  const [runOutput, setRunOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Maximum number of polling attempts
  const MAX_POLL_ATTEMPTS = 30;
  // Delay between polling attempts (in milliseconds)
  const POLL_INTERVAL = 1000;

  /**
   * Polls the run result from the Judge0 API
   * @param token The submission token
   * @returns The final result of the code execution
   */
  const pollRunResult = async (token: string) => {
    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
      try {
        const response = await api.get(`/submissions/run/${token}`);
        const result = response.data;

        // If the submission is not processing or in queue anymore, return the result
        if (result.status.id !== 1 && result.status.id !== 2) {
          return {
            status: result.status,
            stdout: result.stdout,
            stderr: result.stderr,
            time: result.time,
            memory: result.memory,
          };
        }

        // Wait before next polling attempt
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
      } catch (error) {
        console.error("Error polling run result:", error);
        throw new Error("Failed to get run result");
      }
    }

    throw new Error("Polling timeout: Code execution took too long");
  };

  /**
   * Polls the submission status from the backend
   * @param submissionId The ID of the submission
   * @returns The final status of the submission
   */
  const pollSubmissionStatus = async (submissionId: string) => {
    for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
      try {
        const response = await api.get(`/submissions/${submissionId}/status`);
        const { status, completed } = response.data;

        // If the submission processing is complete, return the status
        if (completed) {
          return { status };
        }

        // Wait before next polling attempt
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
      } catch (error) {
        console.error("Error polling submission status:", error);
        throw new Error("Failed to get submission status");
      }
    }

    throw new Error("Polling timeout: Submission processing took too long");
  };

  useEffect(() => {
    const fetchPracticalDetails = async () => {
      try {
        const response = await api.get(`/practicals/${practicalId}`);
        const { course_name, practical_name, pdf_url, description, prac_io } =
          response.data;
        setCourseName(course_name);
        setPracticalName(practical_name);
        setPdfUrl(pdf_url);
        setDescription(description);
        setTestCases(prac_io.filter((io) => io.isPublic));
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch practical details",
          variant: "destructive",
        });
      }
    };

    const fetchPracticalLanguages = async () => {
      try {
        const response = await api.get(`/practicals/${practicalId}/languages`);
        const fetchedLanguages = response.data || []; // Ensure it is an array

        setLanguages(fetchedLanguages);
        if (fetchedLanguages.length > 0) {
          setLanguage(
            fetchedLanguages[0].programming_language_id?.toString() || ""
          );
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch practical languages",
          variant: "destructive",
        });
      }
    };

    fetchPracticalDetails();
    fetchPracticalLanguages();
  }, [practicalId, toast]);

  const handleRun = async () => {
    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Please write some code before running.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsRunning(true);
      setRunOutput(null);

      const response = await api.post("/submissions/run", {
        code,
        language,
        input: customInput,
        userId: user.user_id,
      });

      const result = await pollRunResult(response.data.token);
      setRunOutput({
        output: result.stdout || result.stderr || "No output",
        status: result.status.description,
        time: result.time,
        memory: result.memory,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to run code",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit code.",
        variant: "destructive",
      });
      return;
    }

    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Please write some code before submitting.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmissionStatus(null);

      const response = await api.post("/submissions/submit-code", {
        practicalId,
        language,
        code,
        studentId: user.user_id,
      });

      if (response.data.alreadySubmitted) {
        toast({
          title: "Notice",
          description:
            "You have already submitted this practical successfully.",
        });
        setSubmissionStatus("Accepted");
        return;
      }

      const result = await pollSubmissionStatus(response.data.submissionId);
      setSubmissionStatus(result.status);

      toast({
        title: result.status === "Accepted" ? "Success" : "Not Accepted",
        description:
          result.status === "Accepted"
            ? "Your submission has been accepted!"
            : "Your submission was not accepted. Please try again.",
        variant: result.status === "Accepted" ? "default" : "destructive",
      });
    } catch (error) {
      if (error.response?.status === 429) {
        toast({
          title: "Rate Limited",
          description: "Please wait 30 seconds before submitting again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to submit code",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // const pollSubmissionResults = async (submissionId) => {
  //   const maxAttempts = 10;
  //   const pollInterval = 2000; // 2 seconds

  //   for (let attempt = 0; attempt < maxAttempts; attempt++) {
  //     try {
  //       const response = await api.get(`/submissions/${submissionId}/results`);
  //       if (response.data.status === "completed") {
  //         return response.data;
  //       }
  //       await new Promise((resolve) => setTimeout(resolve, pollInterval));
  //     } catch (error) {
  //       console.error("Polling error:", error);
  //       throw new Error("Failed to get submission results");
  //     }
  //   }
  //   throw new Error("Submission processing timeout");
  // };

  // const handleSubmit = async () => {
  //   if (!user) {
  //     toast({
  //       title: "Error",
  //       description: "You must be logged in to submit code.",
  //       variant: "destructive",
  //     });
  //     return;
  //   }

  //   if (!code.trim()) {
  //     toast({
  //       title: "Error",
  //       description: "Please write some code before submitting.",
  //       variant: "destructive",
  //     });
  //     return;
  //   }

  //   try {
  //     const response = await api.post("/submissions", {
  //       practicalId,
  //       language,
  //       code,
  //       studentId: user.user_id,
  //     });

  //     if (response.data.success) {
  //       toast({
  //         title: "Success",
  //         description: "Code submitted successfully",
  //       });
  //     } else {
  //       toast({
  //         title: "Submission Failed",
  //         description: response.data.message,
  //         variant: "destructive",
  //       });
  //     }
  //   } catch (error) {
  //     toast({
  //       title: "Error",
  //       description: "Failed to submit code",
  //       variant: "destructive",
  //     });
  //   }
  // };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{courseName}</h1>
      <h2 className="text-xl font-semibold mb-4">{practicalName}</h2>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{description}</p>
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              View PDF
            </a>
          )}
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Public Test Cases</CardTitle>
        </CardHeader>
        <CardContent>
          {testCases.map((testCase, index) => (
            <div key={index} className="mb-2">
              <CardDescription>Input: {testCase.input}</CardDescription>
              <CardDescription>Output: {testCase.output}</CardDescription>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="mb-4">
        <Select onValueChange={setLanguage} value={language}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Languages</SelectLabel>
              {languages.map((lang) => (
                <SelectItem
                  key={lang.prac_language.prac_language_id}
                  value={lang.prac_language.programming_language_id?.toString()}
                >
                  {lang.programming_language.language_name ||
                    "Unknown Language"}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <Editor
        height="400px"
        language={
          languages.find(
            (lang) =>
              lang.programming_language.programming_language_id?.toString() ===
              language
          )?.language_name || "javascript"
        }
        value={code}
        onChange={setCode}
        theme="vs-dark"
      />

      {/* <Button onClick={handleSubmit} className="mt-4">
        Submit
      </Button> */}
      <div className="flex gap-2">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit"
          )}
        </Button>
        <Button
          onClick={handleRun}
          variant="outline"
          disabled={isRunning}
          className="flex-1"
        >
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running...
            </>
          ) : (
            "Run"
          )}
        </Button>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Custom Input</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Enter your input here..."
              className="font-mono"
              rows={5}
            />
          </CardContent>
        </Card>

        {runOutput && (
          <Card>
            <CardHeader>
              <CardTitle>Output</CardTitle>
              <CardDescription>
                Time: {runOutput.time}s | Memory:{" "}
                {Math.round(runOutput.memory / 1024)} MB
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap font-mono bg-slate-100 p-4 rounded">
                {runOutput.output}
              </pre>
            </CardContent>
          </Card>
        )}

        {submissionStatus && (
          <Card>
            <CardHeader>
              <CardTitle>Submission Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-lg font-semibold ${
                  submissionStatus === "Accepted"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {submissionStatus}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CodingEnvironmentPage;
