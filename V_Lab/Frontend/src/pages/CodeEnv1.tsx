import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Editor } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbLink,
} from "@/components/ui/breadcrumb";
import { Slash } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/toaster";
import { Loader2 } from "lucide-react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const CodingEnvironmentPage = () => {
  const { courseId, practicalId } = useParams();
  const [courseName, setCourseName] = useState("");
  const [practicalName, setPracticalName] = useState("");
  const [testCases, setTestCases] = useState([]);
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("");
  const [languages, setLanguages] = useState([]);
  const [code, setCode] = useState("");
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [customInput, setCustomInput] = useState("");
  const [runOutput, setRunOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResults, setSubmissionResults] = useState(null);
  const [showSubmissionStatus, setShowSubmissionStatus] = useState(false);
  const [semester, setSemester] = useState("");
  const [srNo, setSrNo] = useState("");
  const [previousSubmission, setPreviousSubmission] = useState<{
    code?: string;
    status?: string;
    submission_id?: number;
    marks?: number;
    submission_time: any;
  } | null>(null);

  // Maximum number of polling attempts and interval
  const MAX_POLL_ATTEMPTS = 10;
  const POLL_INTERVAL = 5000;

  useEffect(() => {
    const fetchPracticalDetails = async () => {
      try {
        const response = await api.get(`/practicals/${practicalId}`);
        const {
          course_name,
          practical_name,
          description,
          prac_io,
          sr_no,
          semester,
        } = response.data;
        setCourseName(course_name);
        setPracticalName(practical_name);
        setDescription(description);
        setSrNo(sr_no);
        setSemester(semester);
        setTestCases(prac_io.filter((io) => io.isPublic));
        const prevSubmissionResponse = await api.get(
          `/submissions/previous/${practicalId}`
        );
        if (prevSubmissionResponse.data?.code) {
          const submission = prevSubmissionResponse.data;
          setPreviousSubmission(submission);
          if (submission.status !== "Accepted") {
            setCode(submission.code);
          }
        }
        if (
          prevSubmissionResponse.data?.message ===
          "No previous submission found"
        ) {
          toast({
            title: "Information",
            description: "You have not before submitted",
            variant: "default",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch practical details",
          variant: "destructive",
        });
      }
    };

    const fetchLanguages = async () => {
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
    fetchLanguages();
  }, [practicalId]);

  // const pollSubmissionStatus = async (submissionId) => {
  //   for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
  //     try {
  //       const response = await api.get(`/submissions/${submissionId}/status`);
  //       const { status, completed, results } = response.data;

  //       if (completed) {
  //         setSubmissionStatus(status);
  //         setSubmissionResults(results);
  //         return;
  //       }

  //       // Update partial results
  //       if (results) {
  //         setSubmissionResults(results);
  //       }

  //       await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
  //     } catch (error) {
  //       console.error("Error polling submission status:", error);

  //       if (error.response && error.response.status === 404) {
  //         setSubmissionStatus("Not Found");
  //         toast({
  //           title: "Error",
  //           description: "Submission not found. Please try submitting again.",
  //           variant: "destructive",
  //         });
  //         return;
  //       }

  //       // For other errors, continue polling
  //       await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
  //     }
  //   }

  //   setSubmissionStatus("Timeout");
  //   toast({
  //     title: "Timeout",
  //     description:
  //       "Submission processing took too long. Please try again later.",
  //     variant: "destructive",
  //   });
  // };

  const pollSubmissionStatus = async (submissionId) => {
    try {
      let attempts = 0;

      while (attempts < MAX_POLL_ATTEMPTS) {
        const response = await api.get(
          `/submissions/${
            submissionId === undefined
              ? previousSubmission?.submission_id
              : submissionId
          }/status`
        );

        if (response.data.completed) {
          setSubmissionStatus(response.data.status);
          setShowSubmissionStatus(true);
          return response.data.status;
        }

        attempts++;
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
      }

      throw new Error("Polling timeout");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get submission status",
        variant: "destructive",
      });
      return null;
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
    if (previousSubmission?.status === "Accepted") {
      toast({
        title: "Already Submitted",
        description: "You have already submitted this practical successfully.",
        variant: "default",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmissionStatus(null);
      setShowSubmissionStatus(true);

      const response = await api.post("/submissions/submit-code", {
        practicalId,
        language,
        code,
        studentId: user.user_id,
        submissionId: previousSubmission?.submission_id || -1, // Send previous submission ID if exists
      });

      const status = await pollSubmissionStatus(response.data.submissionId);

      if (status) {
        setPreviousSubmission((prev) => ({
          ...prev,
          status: status,
          code: code,
          submission_id: response.data.submissionId,
        }));

        toast({
          title: status === "Accepted" ? "Success" : "Not Accepted",
          description:
            status === "Accepted"
              ? "Your submission has been accepted!"
              : "Your submission was not accepted. Please try again.",
          variant: status === "Accepted" ? "default" : "destructive",
        });
      }
    } catch (error: any) {
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
        language: parseInt(language, 10),
        input: customInput,
        userId: user.user_id,
      });

      setRunOutput({
        output: response.data.output,
        status: response.data.status,
        time: response.data.time,
        memory: response.data.memory,
      });
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast({
          title: "Rate Limited",
          description: "Please wait before running code again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to run code",
          variant: "destructive",
        });
      }
    } finally {
      setIsRunning(false);
    }
  };

  const getLanguageName = (languageId) => {
    const selectedLanguage = languages.find(
      (lang) => lang.programming_language_id?.toString() === languageId
    );
    return selectedLanguage?.language_name || "";
  };

  // return (
  //   <div className="container mx-auto p-4 space-y-4">

  //     <h1 className="text-2xl font-bold mb-4">{courseName}</h1>
  //     <h2 className="text-xl font-semibold mb-4">{practicalName}</h2>

  //     <Card className="mb-4">
  //       <CardHeader>
  //         <CardTitle>Description</CardTitle>
  //       </CardHeader>
  //       <CardContent>
  //         <p>{description}</p>
  //       </CardContent>
  //     </Card>

  //     <Card className="mb-4">
  //       <CardHeader>
  //         <CardTitle>Public Test Cases</CardTitle>
  //       </CardHeader>
  //       <CardContent>
  //         {testCases.map((testCase, index) => (
  //           <div key={index} className="mb-2">
  //             <CardDescription>Input: {testCase.input}</CardDescription>
  //             <CardDescription>Output: {testCase.output}</CardDescription>
  //           </div>
  //         ))}
  //       </CardContent>
  //     </Card>

  //     <div className="flex items-center gap-4 mb-4">
  //       <Select
  //         value={language}
  //         onValueChange={(value) => {
  //           console.log("Selected language:", value); // Debug log
  //           setLanguage(value);
  //         }}
  //       >
  //         <SelectTrigger className="w-[180px]">
  //           <SelectValue placeholder="Select language">
  //             {getLanguageName(language) || "Select language"}
  //           </SelectValue>
  //         </SelectTrigger>
  //         <SelectContent>
  //           <SelectGroup>
  //             <SelectLabel>Languages</SelectLabel>
  //             {languages.map((lang) => (
  //               <SelectItem
  //                 key={lang.programming_language?.programming_language_id}
  //                 value={lang.programming_language?.programming_language_id?.toString()}
  //               >
  //                 {lang.programming_language?.language_name ||
  //                   "Unknown Language"}
  //               </SelectItem>
  //             ))}
  //           </SelectGroup>
  //         </SelectContent>
  //       </Select>

  //       <Button
  //         onClick={handleSubmit}
  //         disabled={isSubmitting}
  //         className="flex-1"
  //       >
  //         {isSubmitting ? (
  //           <>
  //             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  //             Submitting...
  //           </>
  //         ) : (
  //           "Submit"
  //         )}
  //       </Button>
  //       <Button
  //         onClick={handleRun}
  //         variant="outline"
  //         disabled={isRunning}
  //         className="flex-1"
  //       >
  //         {isRunning ? (
  //           <>
  //             <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  //             Running...
  //           </>
  //         ) : (
  //           "Run"
  //         )}
  //       </Button>
  //     </div>

  //     {showSubmissionStatus && submissionStatus && (
  //       <Card className="mb-4">
  //         <CardHeader className="flex flex-row items-center justify-between ">
  //           <CardTitle>Submission Status</CardTitle>
  //           <Button
  //             variant="ghost"
  //             size="icon"
  //             onClick={() => setShowSubmissionStatus(false)}
  //           >
  //             <X className="h-4 w-4" />
  //           </Button>
  //         </CardHeader>
  //         <CardContent>
  //           <div
  //             className={`text-lg font-semibold ${
  //               submissionStatus === "Accepted"
  //                 ? "text-green-600"
  //                 : "text-red-600"
  //             }`}
  //           >
  //             {submissionStatus}
  //           </div>
  //         </CardContent>
  //       </Card>
  //     )}

  //     <Editor
  //       height="400px"
  //       language={getLanguageName(language).toLowerCase()}
  //       value={code}
  //       onChange={setCode}
  //       theme="vs-dark"
  //       options={{
  //         minimap: { enabled: false },
  //         fontSize: 14,
  //         lineNumbers: "on",
  //         rulers: [],
  //         wordWrap: "on",
  //         wrappingIndent: "indent",
  //         automaticLayout: true,
  //       }}
  //     />

  //     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
  //       <div>
  //         <Card>
  //           <CardHeader>
  //             <CardTitle>Custom Input</CardTitle>
  //             <CardDescription>Enter input to test your code</CardDescription>
  //           </CardHeader>
  //           <CardContent>
  //             <Textarea
  //               value={customInput}
  //               onChange={(e) => setCustomInput(e.target.value)}
  //               placeholder="Enter your input here..."
  //               className="font-mono h-32"
  //             />
  //           </CardContent>
  //         </Card>
  //       </div>

  //       <div>
  //         {runOutput && (
  //           <Card>
  //             <CardHeader>
  //               <CardTitle>Run Output</CardTitle>
  //               <CardDescription>
  //                 Time: {runOutput.time}s | Memory:{" "}
  //                 {Math.round(runOutput.memory / 1024)} MB
  //               </CardDescription>
  //             </CardHeader>
  //             <CardContent>
  //               <div className="bg-slate-100 p-4 rounded-md">
  //                 <pre className="whitespace-pre-wrap font-mono text-sm">
  //                   {runOutput.output}
  //                 </pre>
  //               </div>
  //             </CardContent>
  //           </Card>
  //         )}
  //       </div>
  //     </div>
  //   </div>
  // );
  return (
    <div className="container">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/semester/${semester}`}>
              Semester {semester}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/course/${courseId}`}>
              {courseName}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Practical {srNo}</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="mx-auto p-4 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">{practicalName}</h2>

            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{description}</p>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Public Test Cases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testCases.map((testCase, index) => (
                    <div key={index} className="p-4 bg-muted rounded-lg">
                      <CardDescription className="mb-2">
                        <span className="font-semibold">Input:</span>{" "}
                        {testCase.input}
                      </CardDescription>
                      <CardDescription>
                        <span className="font-semibold">Output:</span>{" "}
                        {testCase.output}
                      </CardDescription>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Select language">
                  {getLanguageName(language) || "Select language"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Languages</SelectLabel>
                  {languages.map((lang) => (
                    <SelectItem
                      key={lang.programming_language_id}
                      value={lang.programming_language_id?.toString()}
                    >
                      {lang.language_name || "Unknown Language"}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>

            <div className="flex gap-2 w-full">
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
          </div>

          {showSubmissionStatus && submissionStatus && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Submission Status</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSubmissionStatus(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div
                  className={cn(
                    "text-lg font-semibold",
                    submissionStatus === "Accepted"
                      ? "text-green-600"
                      : "text-red-600"
                  )}
                >
                  {submissionStatus}
                </div>
              </CardContent>
            </Card>
          )}

          <Editor
            height="400px"
            language={getLanguageName(language).toLowerCase()}
            value={code}
            onChange={setCode}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              rulers: [],
              wordWrap: "on",
              wrappingIndent: "indent",
              automaticLayout: true,
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Custom Input</CardTitle>
                <CardDescription>Enter input to test your code</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Enter your input here..."
                  className="font-mono h-32"
                />
              </CardContent>
            </Card>

            {runOutput && (
              <Card>
                <CardHeader>
                  <CardTitle>Run Output</CardTitle>
                  <CardDescription>
                    Time: {runOutput.time}s | Memory:{" "}
                    {Math.round(runOutput.memory / 1024)} MB
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-100 p-4 rounded-md">
                    <pre className="whitespace-pre-wrap font-mono text-sm">
                      {runOutput.output}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        <Toaster />
      </div>
    </div>
  );
};

export default CodingEnvironmentPage;
