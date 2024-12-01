import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useToast } from "../components/hooks/use-toast";
import api from "../services/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Breadcrumb,
  BreadcrumbSeparator,
  BreadcrumbItem,
  BreadcrumbLink,
} from "../components/ui/breadcrumb";

const PracticalSubmissionDetails = () => {
  const { practicalId, submissionId } = useParams();
  const [submission, setSubmission] = useState(null);
  const [status, setStatus] = useState("");
  const [marks, setMarks] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubmissionDetails();
  }, [submissionId]);

  const fetchSubmissionDetails = async () => {
    try {
      const response = await api.get(`/submissions/${submissionId}`);
      setSubmission(response.data);
      setStatus(response.data.submission_status);
      setMarks(response.data.marks.toString());
    } catch (error) {
      console.error("Error fetching submission details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch submission details. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/submissions/${submissionId}`, {
        status,
        marks: parseInt(marks),
      });
      toast({
        title: "Success",
        description: "Submission updated successfully.",
      });
    } catch (error) {
      console.error("Error updating submission:", error);
      toast({
        title: "Error",
        description: "Failed to update submission. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!submission) return <div>Loading...</div>;

  return (
    <div className="container mx-auto mt-4 p-4">
      {/* <Breadcrumb className="mb-4">
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/courses">Courses</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href={`/practical-submission/${practicalId}`}>
            Practical Submissions
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink>Submission Details</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb> */}

      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Submission Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Student Name:</Label>
                <div>{submission.student_name}</div>
              </div>
              <div>
                <Label>Roll ID:</Label>
                <div>{submission.roll_id}</div>
              </div>
              <div>
                <Label>Batch:</Label>
                <div>{submission.batch_name}</div>
              </div>
              <div>
                <Label>Practical SR No:</Label>
                <div>{submission.practical_sr_no}</div>
              </div>
              <div>
                <Label>Practical Name:</Label>
                <div>{submission.practical_name}</div>
              </div>
              <div>
                <Label>Course Name:</Label>
                <div>{submission.course_name}</div>
              </div>
              <div>
                <Label>Submission Time:</Label>
                <div>
                  {new Date(submission.submission_time).toLocaleString()}
                </div>
              </div>
            </div>
            <div>
              <Label>Practical Input/Output:</Label>
              <div className="bg-gray-100 p-2 rounded">
                {submission.prac_io}
              </div>
            </div>
            <div>
              <Label>Code Submitted:</Label>
              <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
                {submission.code_submitted}
              </pre>
            </div>
            <div>
              <Label htmlFor="status">Status:</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Accepted">Accepted</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="marks">Marks:</Label>
              <Input
                type="number"
                id="marks"
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleUpdate} className="w-full">
            Update Submission
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PracticalSubmissionDetails;
