import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardFooter } from "../components/ui/card";
import { Switch } from "../components/ui/switch";
import { Slash } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "../components/ui/breadcrumb";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../components/ui/drawer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { Input } from "../components/ui/input";
import { PlusIcon, Pencil, Trash2, Users, Lock } from "lucide-react";

const PracticalList = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [practicals, setPracticals] = useState([]);
  const [course, setCourse] = useState(null);
  const [batchAccess, setBatchAccess] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedPracticalId, setSelectedPracticalId] = useState(null);
  const user = useAuthStore((state) => state.user);
  const isStudent = user?.role === "Student";

  useEffect(() => {
    fetchPracticals();
    fetchCourse();
  }, [courseId]);

  useEffect(() => {}, [course]);

  const handlePracticalClick = (practical) => {
    // if (isStudent) {
    navigate(`/coding/${courseId}/${practical.practical_id}`);
    // } else {
    // navigate(`/practical-submission/${practical.practical_id}`);
    // }
  };

  const fetchPracticals = async () => {
    try {
      let response;
      if (isStudent) {
        response = await api.get(`/practicals/${courseId}/student-view`);
      } else {
        response = await api.get(`/practicals/course/${courseId}`);
      }
      const sortedPracticals = response.data.sort((a, b) => a.sr_no - b.sr_no);
      setPracticals(sortedPracticals);
    } catch (error) {
      console.error("Error fetching practicals:", error);
    }
  };

  const fetchCourse = async () => {
    try {
      const response = await api.get(`/courses/${courseId}`);
      setCourse(response.data[0]);
    } catch (error) {
      console.error("Error fetching course:", error);
    }
  };

  // Update the fetchBatchAccess function to include courseId
  const fetchBatchAccess = async (practicalId) => {
    try {
      const response = await api.get(
        `/batch-practical-access/${practicalId}/${courseId}/${user.user_id}`
      );
      const batchesWithDefaults = response.data.map((batch) => ({
        ...batch,
        lock: batch.lock === null ? true : batch.lock,
        deadline: batch.deadline || new Date().toISOString().slice(0, 16),
      }));
      setBatchAccess(batchesWithDefaults);
    } catch (error) {
      console.error("Error fetching batch access:", error);
    }
  };

  const handleAccessSubmit = async (batchId) => {
    try {
      const accessData = batchAccess.find(
        (access) => access.batch_id === batchId
      );

      if (!accessData) {
        console.error("No access data found for this batch");
        return;
      }
      if (accessData.lock == null) {
        accessData.lock = false;
      }

      await api.post("/batch-practical-access", {
        practical_id: selectedPracticalId,
        batch_id: batchId,
        lock: accessData.lock,
        deadline:
          accessData.deadline === "Not set" ? null : accessData.deadline,
      });

      await fetchBatchAccess(selectedPracticalId);
    } catch (error) {
      console.error("Error updating batch access:", error);
    }
  };

  const handleAccessClick = (practicalId) => {
    setSelectedPracticalId(practicalId);
    fetchBatchAccess(practicalId);
    setIsDrawerOpen(true);
  };

  const handleDelete = async (practicalId) => {
    try {
      await api.delete(`/practicals/${practicalId}`);
      fetchPracticals();
    } catch (error) {
      console.error("Error deleting practical:", error);
    }
  };

  const renderFacultyCard = (practical) => (
    <Card
      key={practical.practical_id}
      className="mb-4 w-full transform hover:scale-105 transition-transform duration-200"
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <h3
            className="text-lg font-semibold truncate cursor-pointer hover:text-blue-600"
            onClick={() => handlePracticalClick(practical)}
          >
            {practical.sr_no}. {practical.practical_name}
          </h3>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                navigate(
                  `/practicals/${courseId}/${practical.practical_id}/edit`
                )
              }
            >
              <Pencil className="mr-2 h-4 w-4" /> Update
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                navigate(
                  `/practical-submission/${courseId}/${practical.practical_id}`
                )
              }
            >
              <Users className="mr-2 h-4 w-4" /> Submissions
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAccessClick(practical.practical_id)}
            >
              <Lock className="mr-2 h-4 w-4" /> Access
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the practical.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(practical.practical_id)}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderStudentCard = (practical) => {
    const isLocked = practical.lock;
    const hasPassedDeadline = new Date(practical.deadline) < new Date();
    const isPastDeadlineUnsuccessful =
      hasPassedDeadline && practical.status !== "Accepted";
    if (isLocked) {
      return null; // Don't render locked practicals for students
    }
    return (
      <Card
        key={practical.practical_id}
        className={`mb-4 w-full transform hover:scale-105 transition-transform duration-200 ${
          isPastDeadlineUnsuccessful ? "border-red-500" : ""
        }${practical.status === "Accepted" ? "border-green-500" : ""}`}
      >
        <CardContent
          className="p-4"
          // onClick={() =>
          //   (!hasPassedDeadline || practical.status !== "Accepted") &&
          //   handlePracticalClick(practical)
          // }
        >
          <div className="flex justify-between items-center">
            <h3
              className="text-lg font-semibold truncate cursor-pointer hover:text-blue-600"
              onClick={() => handlePracticalClick(practical)}
            >
              {practical.sr_no}. {practical.practical_name}
            </h3>
            <div>
              <span
                className={`mr-2 px-2 py-1 rounded-full text-xs ${
                  isPastDeadlineUnsuccessful
                    ? "bg-red-100 text-red-800"
                    : practical.status === "Accepted"
                    ? "bg-green-100 text-green-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                Status: {practical.status || "Not Submitted"}
              </span>
              {practical.status === "Accepted" && (
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                  Marks: {practical.marks || 0}
                </span>
              )}
            </div>
          </div>
          <div className="flex justify-between items-center">
            {/* <h3
              className="text-lg font-semibold truncate"
              onClick={() => handlePracticalClick(practical)}
            >
              {practical.sr_no}. {practical.practical_name}
            </h3> */}
            <p className="mt-2 text-sm text-gray-600">
              {practical.description}
            </p>
            <div>
              <p className="mt-2 text-sm text-gray-500">
                Deadline:
                {new Date(practical.deadline).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
        {/* <CardFooter className="flex justify-end ">
          <p className="text-sm text-gray-500">
            Deadline:
            {new Date(formatDate(practical.deadline)).toLocaleString()}
          </p>
        </CardFooter> */}
      </Card>
    );
  };

  return (
    <div className="container mx-auto mt-4 p-4">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <Slash />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink href={`/departments/${course?.department_id}`}>
              {course?.department_name}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <Slash />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbLink
              href={`/departments/${course?.department_id}/semester/${course?.semester}`}
            >
              Semester {course?.semester}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <Slash />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>{course?.course_name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <h1 className="text-3xl font-bold mb-6">
        {course?.course_name} Practicals
      </h1>

      {practicals.map((practical) =>
        isStudent ? renderStudentCard(practical) : renderFacultyCard(practical)
      )}

      {!isStudent && (
        <div className="fixed bottom-4 right-4">
          <Button onClick={() => navigate(`/practical-creation/${courseId}`)}>
            <PlusIcon className="mr-2 h-4 w-4" /> Add Practical
          </Button>
        </div>
      )}

      {/* <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Batch Practical Access</DrawerTitle>
            <DrawerDescription>
              Manage access for different batches
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <div className="max-h-[60vh] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Division</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Lock</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batchAccess.map((access) => (
                    <TableRow key={access.batch_id}>
                      <TableCell>{access.division}</TableCell>
                      <TableCell>{access.batch_name}</TableCell>
                      <TableCell>
                        <Switch
                          checked={access.lock}
                          onCheckedChange={(checked) => {
                            setBatchAccess(
                              batchAccess.map((a) =>
                                a.batch_id === access.batch_id
                                  ? { ...a, lock: checked }
                                  : a
                              )
                            );
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="datetime-local"
                          value={new Date(access.deadline)
                            .toISOString()
                            .slice(0, 16)}
                          onChange={(e) => {
                            setBatchAccess(
                              batchAccess.map((a) =>
                                a.batch_id === access.batch_id
                                  ? { ...a, deadline: e.target.value }
                                  : a
                              )
                            );
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => handleAccessSubmit(access.batch_id)}
                        >
                          Submit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer> */}

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Batch Practical Access</DrawerTitle>
            <DrawerDescription>
              Manage access for different batches
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4">
            <div className="max-h-[60vh] overflow-y-auto">
              {batchAccess.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Division</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Lock</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {batchAccess.map((access) => (
                      <TableRow key={access.batch_id}>
                        <TableCell>{access.division}</TableCell>
                        <TableCell>{access.batch_name}</TableCell>
                        <TableCell>
                          <Switch
                            checked={access.lock}
                            onCheckedChange={(checked) => {
                              setBatchAccess(
                                batchAccess.map((a) =>
                                  a.batch_id === access.batch_id
                                    ? { ...a, lock: checked }
                                    : a
                                )
                              );
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="datetime-local"
                            placeholder="Deadline stored in ISO format"
                            value={
                              access.deadline !== "Not set"
                                ? new Date(access.deadline)
                                    .toISOString()
                                    .slice(0, 19)
                                : "00-00-0000T00:00"
                            }
                            onChange={(e) => {
                              setBatchAccess(
                                batchAccess.map((a) =>
                                  a.batch_id === access.batch_id
                                    ? { ...a, deadline: e.target.value }
                                    : a
                                )
                              );
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() => handleAccessSubmit(access.batch_id)}
                          >
                            Submit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-4">
                  No batches assigned for this course
                </div>
              )}
            </div>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default PracticalList;
