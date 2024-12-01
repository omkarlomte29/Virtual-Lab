import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Input } from "../components/ui/input";

interface Student {
  student_id: number;
  name: string;
  email: string;
  semester: number;
  division: string;
  batch: string;
}

const StudentsPage = () => {
  const [filters, setFilters] = useState({
    department: "",
    semester: "",
    division: "",
    batch: "",
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState([]);
  const [semesters] = useState([1, 2, 3, 4, 5, 6, 7, 8]);
  const [divisions, setDivisions] = useState([]);
  const [batches, setBatches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [departmentData, divisionData] = await Promise.all([
          api.get("/departments"),
          api.get("/students/divisions"),
          // api.get("/students/batches"),
        ]);

        setDepartments(departmentData.data);
        setDivisions(divisionData.data);
        // setBatches(batchData.data);

        // Initial student fetch
        fetchStudents();
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [filters]);

  // Fetch students based on filters
  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      // Only include non-empty filters in the request
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== "")
      );

      const response = await api.get("/students", {
        params: activeFilters,
      });
      setStudents(response.data);
      setFilteredStudents(response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = async (name: string, value: string) => {
    setFilters((prev) => {
      const newFilters = {
        ...prev,
        [name]: value,
        // Reset dependent filters
        ...(name === "department" && { semester: "", division: "", batch: "" }),
        ...(name === "semester" && { division: "", batch: "" }),
        ...(name === "division" && { batch: "" }),
      };

      // Fetch students with new filters
      (async () => {
        setIsLoading(true);
        try {
          if (name === "department") {
            // Fetch new divisions and batches for selected department
            const divisionData = await api.get("/students/divisions", {
              params: { department: value },
            });
            setDivisions(divisionData.data);
          }

          if (name === "semester" && filters.department) {
            // Fetch batches for selected department and semester
            const batchData = await api.get(
              `/students/batches/${filters.department}/${value}`
            );
            setBatches(batchData.data);
          }

          // Fetch students with new filters
          const activeFilters = Object.fromEntries(
            Object.entries(newFilters).filter(([_, v]) => v !== "")
          );
          const response = await api.get("/students", {
            params: activeFilters,
          });
          setStudents(response.data);
          setFilteredStudents(response.data);
        } catch (error) {
          console.error("Error updating filters:", error);
        } finally {
          setIsLoading(false);
        }
      })();

      return newFilters;
    });
  };

  // Handle search
  useEffect(() => {
    const searchResults = students.filter((student) =>
      Object.values(student)
        .join(" ")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
    setFilteredStudents(searchResults);
  }, [searchQuery, students]);

  // Navigate to StudentSubmissions page
  const handleStudentClick = (studentID: number) => {
    navigate(`/StudentSubmissions/${studentID}`);
  };

  return (
    <div className="container mx-auto mt-4 p-4">
      <h1 className="text-2xl font-bold mb-4">Students List</h1>

      {/* Filter Section */}
      <div className="flex flex-wrap gap-4 mb-4">
        <Select
          value={filters.department}
          onValueChange={(value) => handleFilterChange("department", value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((department: any) => (
              <SelectItem
                key={department.department_id}
                value={department.department_id.toString()}
              >
                {department.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.semester}
          onValueChange={(value) => handleFilterChange("semester", value)}
          disabled={!filters.department}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Semester" />
          </SelectTrigger>
          <SelectContent>
            {semesters.map((semester) => (
              <SelectItem key={semester} value={semester.toString()}>
                Semester {semester}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.division}
          onValueChange={(value) => handleFilterChange("division", value)}
          disabled={!filters.semester}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Division" />
          </SelectTrigger>
          <SelectContent>
            {divisions.map((division: string) => (
              <SelectItem key={division} value={division}>
                {division}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.batch}
          onValueChange={(value) => handleFilterChange("batch", value)}
          disabled={!filters.division}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Batch" />
          </SelectTrigger>
          <SelectContent>
            {batches.map((batch: string) => (
              <SelectItem key={batch} value={batch}>
                {batch}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Search Box */}
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search Students"
          className="w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Loading Indicator */}
      {isLoading && <p>Loading students...</p>}

      {/* Students Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Semester</TableHead>
            <TableHead>Division</TableHead>
            <TableHead>Batch</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredStudents.map((student) => (
            <TableRow key={student.student_id}>
              <TableCell>
                <button
                  className="text-blue-500 underline"
                  onClick={() => handleStudentClick(student.student_id)}
                >
                  {student.name}
                </button>
              </TableCell>
              <TableCell>{student.email}</TableCell>
              <TableCell>{student.semester}</TableCell>
              <TableCell>{student.division}</TableCell>
              <TableCell>{student.batch}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default StudentsPage;
