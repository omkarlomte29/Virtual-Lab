import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useCourseStore } from "../store/courseStore";
import { useDepartmentStore } from "../store/departmentStore";
import { useAuthStore } from "../store/authStore";
import { getBatchesByDepartmentAndSemeter } from "@/services/api";
import api from "../services/api";
import { ChevronDown, Slash } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "../components/ui/breadcrumb";
import { Button } from "../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { toast } from "../components/hooks/use-toast";

interface Faculty {
  user_id: number;
  department_id: number;
  username: string;
}

interface Batch {
  batch_id: number;
  department_id: number;
  semester: number;
  division: string;
  batch: string;
}

interface Assignment {
  course_id: number;
  faculty_id: number;
  batch_id: number;
}

const CourseAssign: React.FC = () => {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [assignments, setAssignments] = useState<{ [key: string]: number }>({});
  const [selectedFaculty, setSelectedFaculty] = useState<{
    [key: string]: number;
  }>({});
  const [coursesByDepartment, setCoursesByDepartment] = useState<any[]>([]);

  const course = useCourseStore((state) =>
    state.courses.find((c) => c.course_id.toString() === courseId)
  );
  const department = useDepartmentStore((state) =>
    state.departments.find((d) => d.department_id === course?.department_id)
  );
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchData = async () => {
      if (course && user?.department_id) {
        try {
          // Fetch faculty list
          const facultyResponse = await api.get<Faculty[]>(
            `/faculty/department2/${course.department_id}`
          );
          setFacultyList(facultyResponse.data);

          // Fetch batches for the department and semester
          const batchResponse = await getBatchesByDepartmentAndSemeter(
            course.department_id,
            course.semester
          );
          setBatches(batchResponse.data);

          // Fetch existing faculty assignments
          const assignmentsResponse = await api.get<Assignment[]>(
            `/course-faculty/${courseId}`
          );
          const assignmentsMap = assignmentsResponse.data.reduce(
            (acc, assignment) => {
              acc[`${assignment.batch_id}`] = assignment.faculty_id;
              return acc;
            },
            {} as { [key: string]: number }
          );
          setAssignments(assignmentsMap);

          // Fetch courses for the department and semester
          const coursesResponse = await api.get(
            `/courses/department/${course.department_id}`
            // `/semester/${course.semester}/department/${course.department_id}`
          );
          setCoursesByDepartment(
            coursesResponse.data.filter(
              (c: any) => c.semester === course.semester
            )
          );
        } catch (error) {
          console.error("Failed to fetch data:", error);
          toast({
            title: "Error",
            description: "Failed to fetch data. Please try again.",
            variant: "destructive",
          });
        }
      }
    };
    fetchData();
  }, [courseId, course, user]);

  const handleFacultySelect = (batchId: number, facultyId: string) => {
    setSelectedFaculty((prev) => ({
      ...prev,
      [batchId]: parseInt(facultyId),
    }));
  };

  const handleAssign = async (batchId: number) => {
    const facultyId = selectedFaculty[batchId];
    if (!facultyId) {
      toast({
        title: "Error",
        description: "Please select a faculty first.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (assignments[batchId]) {
        // Update existing assignment
        await api.put(`/course-faculty/${courseId}/${batchId}`, {
          faculty_id: facultyId,
        });
      } else {
        // Create new assignment
        await api.post("/course-faculty", {
          course_id: parseInt(courseId!),
          batch_id: batchId,
          faculty_id: facultyId,
        });
      }

      setAssignments((prev) => ({
        ...prev,
        [batchId.toString()]: facultyId,
      }));

      toast({
        title: "Success",
        description: "Faculty assigned successfully!",
      });

      // Clear selection after successful assignment
      setSelectedFaculty((prev) => {
        const newState = { ...prev };
        delete newState[batchId];
        return newState;
      });
    } catch (error) {
      console.error("Failed to assign faculty:", error);
      toast({
        title: "Error",
        description: "Failed to assign faculty. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCourseSelect = (courseId: string) => {
    navigate(`/course-assign/${courseId}`);
  };

  if (!course || !department) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/courses">Courses</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <Slash />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink>{department.name}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <Slash />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink>Semester {course.semester}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <Slash />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1">
                {course.course_name}
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {coursesByDepartment.map((course) => (
                  <DropdownMenuItem
                    key={course.course_id}
                    onClick={() => handleCourseSelect(course.course_id)}
                  >
                    {course.course_name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Division</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Faculty</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {batches.map((batch) => (
              <TableRow key={batch.batch_id}>
                <TableCell>{batch.division}</TableCell>
                <TableCell>{batch.batch}</TableCell>
                <TableCell className="w-1/3">
                  <Select
                    value={selectedFaculty[batch.batch_id]?.toString()}
                    onValueChange={(value) =>
                      handleFacultySelect(batch.batch_id, value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          assignments[batch.batch_id]
                            ? facultyList.find(
                                (f) => f.user_id === assignments[batch.batch_id]
                              )?.username
                            : "Not Assigned"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {facultyList.map((faculty) => (
                        <SelectItem
                          key={faculty.user_id}
                          value={faculty.user_id.toString()}
                        >
                          {faculty.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button
                    onClick={() => handleAssign(batch.batch_id)}
                    disabled={!selectedFaculty[batch.batch_id]}
                  >
                    Assign
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CourseAssign;
