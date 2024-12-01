import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Editor } from "@monaco-editor/react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { useToast } from "../components/hooks/use-toast";
import api from "../services/api";
import { useAuthStore } from "../store/authStore";

const PracticalSubmissionDetailsPage = () => {
  const { practicalId, submissionId } = useParams();
  const [practical, setPractical] = useState<any>(null);
  const [submission, setSubmission] = useState<any>(null);
  const { toast } = useToast();
  // const { user } = useAuthStore();
  const [status, setStatus] = useState("");
  const [marks, setMarks] = useState(0);

  useEffect(() => {
    const fetchPracticalAndSubmission = async () => {
      try {
        const [practicalResponse, submissionResponse] = await Promise.all([
          api.get(`/practicals/${practicalId}`),
          api.get(`/submissions/${submissionId}`),
        ]);
        setPractical(practicalResponse.data);
        setSubmission(submissionResponse.data);
        setStatus(submissionResponse.data.status);
        setMarks(submissionResponse.data.marks);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch practical and submission details",
          variant: "destructive",
        });
      }
    };

    fetchPracticalAndSubmission();
  }, [practicalId, submissionId, toast]);

  const handleUpdateSubmission = async () => {
    try {
      await api.put(`/submissions/${submissionId}`, {
        status,
        marks,
      });
      toast({
        title: "Success",
        description: "Submission updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update submission",
        variant: "destructive",
      });
    }
  };

  if (!practical || !submission) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{practical.course_name}</h1>
      <h2 className="text-xl font-semibold mb-4">
        Practical {practical.sr_no}: {practical.practical_name}
      </h2>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Submission Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <CardDescription>
              Student Roll ID: {submission.rollId}
            </CardDescription>
            <CardDescription>
              Student Name: {submission.studentName}
            </CardDescription>
          </div>
          <div className="mb-4">
            <CardDescription>Submitted Code:</CardDescription>
            <Editor
              height="300px"
              language={submission.language}
              value={submission.code}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontFamily: "'Fira Code', monospace",
                fontSize: 14,
              }}
            />
          </div>
          <div className="mb-4">
            <CardDescription>Input/Output Test Cases:</CardDescription>
            {practical.prac_io.map((testCase, index) => (
              <div key={index} className="mb-2">
                <CardDescription>Input: {testCase.input}</CardDescription>
                <CardDescription>Output: {testCase.output}</CardDescription>
              </div>
            ))}
          </div>
          <div className="mb-4">
            <CardDescription>
              Programming Language: {submission.language}
            </CardDescription>
          </div>
          <div className="flex items-center">
            <Select onValueChange={setStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Status</SelectLabel>
                  <SelectItem value="Accepted">Accepted</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <input
              type="number"
              value={marks}
              onChange={(e) => setMarks(parseInt(e.target.value))}
              className="ml-4 px-2 py-1 border rounded"
            />
            <Button onClick={handleUpdateSubmission} className="ml-4">
              Update Submission
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PracticalSubmissionDetailsPage;
