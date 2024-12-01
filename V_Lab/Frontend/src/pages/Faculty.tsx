import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import useFacultyStore from "../store/facultyStore";
import { useAuthStore } from "../store/authStore";

const FacultyPage = () => {
  const {
    faculty,
    departments,
    fetchDepartments,
    fetchFaculty,
    addFaculty,
    deleteFaculty,
    isLoading,
    error,
  } = useFacultyStore();

  const user = useAuthStore((state) => state.user);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [department, setDepartment] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFacultyModalOpen, setIsFacultyModalOpen] = useState(false);
  const [isHODModalOpen, setIsHODModalOpen] = useState(false);
  const [newFaculty, setNewFaculty] = useState({
    username: "",
    email: "",
    password: "",
    department_id: "",
    role: "faculty",
  });
  const [newHOD, setNewHOD] = useState({
    username: "",
    email: "",
    password: "",
    department_id: "",
    role: "HOD",
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchFaculty(department);
  }, [department]);

  const handleSearch = (e) => setSearchQuery(e.target.value);

  const filteredFaculty = faculty.filter((member) =>
    member.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInputChange = (e, isHOD = false) => {
    const { name, value } = e.target;
    if (isHOD) {
      setNewHOD((prev) => ({ ...prev, [name]: value }));
    } else {
      setNewFaculty((prev) => ({ ...prev, [name]: value }));
    }
  };

  // const handleAddFaculty = async () => {
  //   try {
  //     const hashedPassword = await bcrypt.hash(newFaculty.password, 10);
  //     await addFaculty({ ...newFaculty, password: hashedPassword });
  //     toast({
  //       title: "Success",
  //       description: "Faculty added successfully.",
  //       variant: "default",
  //     });
  //     setIsFacultyModalOpen(false);
  //     setNewFaculty({
  //       username: "",
  //       email: "",
  //       password: "",
  //       department_id: "",
  //       role: "faculty",
  //     });
  //   } catch (error: any) {
  //     console.error("Error adding faculty:", error);
  //     toast({
  //       title: "Error",
  //       description: error?.message || "Failed to add faculty.",
  //       variant: "destructive",
  //     });
  //   }
  // };

  // const handleAddHOD = async () => {
  //   try {
  //     const hashedPassword = await bcrypt.hash(newHOD.password, 10);
  //     await addFaculty({ ...newHOD, password: hashedPassword });
  //     toast({
  //       title: "Success",
  //       description: "HOD added successfully.",
  //       variant: "default",
  //     });
  //     setIsHODModalOpen(false);
  //     setNewHOD({
  //       username: "",
  //       email: "",
  //       password: "",
  //       department_id: "",
  //       role: "HOD",
  //     });
  //   } catch (error: any) {
  //     console.error("Error adding HOD:", error);
  //     toast({
  //       title: "Error",
  //       description: error?.message || "Failed to add HOD.",
  //       variant: "destructive",
  //     });
  //   }
  // };

  const handleAddFaculty = async () => {
    try {
      const response = await api.post("/auth/register", {
        ...newFaculty,
        role: "Faculty",
      });

      const { user, token } = response.data;

      toast({
        title: "Success",
        description: `Faculty ${user.username} added successfully.`,
        variant: "default",
      });

      // Close the modal and reset the form
      setIsFacultyModalOpen(false);
      setNewFaculty({
        username: "",
        email: "",
        password: "",
        department_id: "",
        role: "faculty",
      });

      // Optionally, refetch faculty to update the table with new data
      fetchFaculty(department);
    } catch (error: any) {
      console.error("Error adding faculty:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to add faculty.",
        variant: "destructive",
      });
    }
  };

  const handleAddHOD = async () => {
    try {
      const response = await api.post("/auth/register", {
        ...newHOD,
        role: "HOD",
      });

      const { user, token } = response.data;

      toast({
        title: "Success",
        description: `HOD ${user.username} added successfully.`,
        variant: "default",
      });

      // Close the modal and reset the form
      setIsHODModalOpen(false);
      setNewHOD({
        username: "",
        email: "",
        password: "",
        department_id: "",
        role: "HOD",
      });

      // Optionally, refetch faculty to update the table with new data
      fetchFaculty(department);
    } catch (error: any) {
      console.error("Error adding HOD:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to add HOD.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteFaculty = async (facultyId) => {
    if (!window.confirm("Are you sure you want to delete this faculty member?"))
      return;
    try {
      await deleteFaculty(facultyId);
      toast({
        title: "Deleted",
        description: "Faculty member has been deleted.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error deleting faculty:", error);
      toast({
        title: "Error",
        description: "Failed to delete faculty. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto mt-4 p-4">
      <h1 className="text-2xl font-bold mb-4">Faculty and HOD Management</h1>
      <div className="flex flex-wrap gap-4 mb-4">
        <Select value={department} onValueChange={setDepartment}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dep: any) => (
              <SelectItem key={dep.department_id} value={dep.department_id}>
                {dep.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="text"
          placeholder="Search by Username"
          value={searchQuery}
          onChange={handleSearch}
          className="w-[200px]"
        />
        {user?.role === "HOD" && (
          <Dialog
            open={isFacultyModalOpen}
            onOpenChange={setIsFacultyModalOpen}
          >
            <DialogTrigger asChild>
              <Button onClick={() => setIsFacultyModalOpen(true)}>
                Add Faculty
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Faculty</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={newFaculty.username}
                  onChange={(e) => handleInputChange(e)}
                  required
                />
                <Input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={newFaculty.email}
                  onChange={(e) => handleInputChange(e)}
                  required
                />
                <Input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={newFaculty.password}
                  onChange={(e) => handleInputChange(e)}
                  required
                />
                <Select
                  value={newFaculty.department_id}
                  onValueChange={(value) =>
                    setNewFaculty((prev) => ({ ...prev, department_id: value }))
                  }
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dep: any) => (
                      <SelectItem
                        key={dep.department_id}
                        value={dep.department_id}
                      >
                        {dep.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end mt-4">
                <Button onClick={handleAddFaculty}>Add</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
        {user?.role === "Admin" && (
          <Dialog open={isHODModalOpen} onOpenChange={setIsHODModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsHODModalOpen(true)}>Add HOD</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add HOD</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={newHOD.username}
                  onChange={(e) => handleInputChange(e, true)}
                  required
                />
                <Input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={newHOD.email}
                  onChange={(e) => handleInputChange(e, true)}
                  required
                />
                <Input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={newHOD.password}
                  onChange={(e) => handleInputChange(e, true)}
                  required
                />
                <Select
                  value={newHOD.department_id}
                  onValueChange={(value) =>
                    setNewHOD((prev) => ({ ...prev, department_id: value }))
                  }
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dep: any) => (
                      <SelectItem
                        key={dep.department_id}
                        value={dep.department_id}
                      >
                        {dep.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end mt-4">
                <Button onClick={handleAddHOD}>Add</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Actions</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Department</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredFaculty.map((member) => (
            <TableRow key={member.faculty_id}>
              <TableCell>{member.username}</TableCell>
              <TableCell>{member.email}</TableCell>
              <TableCell>{member.role}</TableCell>
              <TableCell>{member.department}</TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteFaculty(member.faculty_id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default FacultyPage;
