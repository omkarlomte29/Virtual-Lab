import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";
import { useToast } from "../components/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Button } from "../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";

const StudentSubmissionsPage = () => {
  const { studentId } = useParams();
  const [student, setStudent] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchStudentDetails();
    fetchStudentSubmissions();
  }, [studentId]);

  const fetchStudentDetails = async () => {
    try {
      const response = await api.get(
        `/submissions/student-details/${studentId}`
      );
      setStudent(response.data);
    } catch (error) {
      console.error("Error fetching student details:", error);
      toast({
        title: "Error",
        description: "Failed to fetch student details. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchStudentSubmissions = async () => {
    try {
      const response = await api.get(`/submissions/student/${studentId}`);
      setSubmissions(response.data);
    } catch (error) {
      console.error("Error fetching student submissions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch student submissions. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!student) return <div>Loading...</div>;

  return (
    <div className="container mx-auto mt-4 p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Student Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Name:</strong> {student.name}
            </div>
            <div>
              <strong>Roll ID:</strong> {student.roll_id}
            </div>
            <div>
              <strong>Email:</strong> {student.email}
            </div>
            <div>
              <strong>Semester:</strong> {student.semester}
            </div>
            <div>
              <strong>Division:</strong> {student.division}
            </div>
            <div>
              <strong>Batch:</strong> {student.batch}
            </div>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-bold mb-4">Submissions</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Course Name</TableHead>
            <TableHead>Practical SR No</TableHead>
            <TableHead>Practical Name</TableHead>
            <TableHead>Submission Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Marks</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.map((submission) => (
            <TableRow key={submission.submission_id}>
              <TableCell>{submission.course_name}</TableCell>
              <TableCell>{submission.practical_sr_no}</TableCell>
              <TableCell>{submission.practical_name}</TableCell>
              <TableCell>
                {new Date(submission.submission_time).toLocaleString()}
              </TableCell>
              <TableCell>{submission.status}</TableCell>
              <TableCell>{submission.marks}</TableCell>
              <TableCell>
              <Button variant="outline">
  <Link to={`/practical-submission-details/${submission.practical_id}/${submission.submission_id}`}>
    Go to Submission
  </Link>
</Button>
                {/* <Button
                  //@ts-ignore
                  as={Link}
                  to={`/practical-submission-details/${submission.practical_id}/${submission.submission_id}`}
                  variant="outline"
                >
                  View Details
                </Button> */}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default StudentSubmissionsPage;
