import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useToast } from "../components/hooks/use-toast";
import api from "../services/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from "../components/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useAuthStore } from "../store/authStore";

const PracticalSubmissionPage = () => {
  const { practicalId } = useParams();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [practicalName, setPracticalName] = useState("");
  const [searchRollId, setSearchRollId] = useState("");
  const { toast } = useToast();
  const user: any = useAuthStore((state) => state.user);

  useEffect(() => {
    fetchBatches();
    fetchPracticalDetails();
  }, []);

  useEffect(() => {
    if (selectedBatch) {
      fetchSubmissions();
    }
  }, [selectedBatch, practicalId]);

  useEffect(() => {
    filterSubmissions();
  }, [submissions, searchRollId]);

  const fetchBatches = async () => {
    try {
      const response = await api.get(`/faculty/batches/${user.user_id}`);
      setBatches(response.data);
      if (response.data.length > 0) {
        setSelectedBatch(response.data[0].batch_id);
      }
    } catch (error) {
      console.error("Error fetching batches:", error);
      toast({
        title: "Error",
        description: "Failed to fetch batches. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchPracticalDetails = async () => {
    try {
      const response = await api.get(`/practicals/${practicalId}`);
      setPracticalName(response.data.practical_name);
    } catch (error) {
      console.error("Error fetching practical details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch practical details. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchSubmissions = async () => {
    try {
      const response = await api.get(
        `/submissions/practical/${practicalId}?batchId=${selectedBatch}`
      );
      setSubmissions(response.data);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch submissions. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewSubmission = (submissionId) => {
    navigate(`/practical-submission-details/${practicalId}/${submissionId}`);
  };

  const filterSubmissions = () => {
    const filtered = submissions.filter((submission) =>
      submission.roll_id.toLowerCase().includes(searchRollId.toLowerCase())
    );
    setFilteredSubmissions(filtered);
  };

  const handleSearchChange = (e) => {
    setSearchRollId(e.target.value);
  };

  return (
    <div className="container mx-auto mt-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Practical Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p>
              Practical {practicalId}: {practicalName}
            </p>
            <div className="flex items-center space-x-4 mt-2">
              <Select value={selectedBatch} onValueChange={setSelectedBatch}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a batch" />
                </SelectTrigger>
                <SelectContent>
                  {batches.map((batch) => (
                    <SelectItem key={batch.batch_id} value={batch.batch_id}>
                      {batch.division} - {batch.batch_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="text"
                placeholder="Search by Roll ID"
                value={searchRollId}
                onChange={handleSearchChange}
                className="w-[200px]"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roll ID</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submission Time</TableHead>
                <TableHead>Marks</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.map((submission) => (
                <TableRow key={submission.submission_id}>
                  <TableCell>{submission.roll_id}</TableCell>
                  <TableCell>{submission.student_name}</TableCell>
                  <TableCell>{submission.status}</TableCell>
                  <TableCell>
                    {new Date(submission.submission_time).toLocaleString()}
                  </TableCell>
                  <TableCell>{submission.marks}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() =>
                        handleViewSubmission(submission.submission_id)
                      }
                      variant="outline"
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default PracticalSubmissionPage;
