import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDepartmentStore, Department } from "../store/departmentStore";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "../components/ui/drawer";
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
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

const DepartmentComponent: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [departmentName, setDepartmentName] = useState("");
  const [refresh, setRefresh] = useState(false);
  const navigate = useNavigate();

  const departments = useDepartmentStore((state) => state.departments);
  const fetchDepartments = useDepartmentStore(
    (state) => state.fetchDepartments
  );
  const createDepartment: any = useDepartmentStore(
    (state) => state.createDepartment
  );
  const updateDepartment: any = useDepartmentStore(
    (state) => state.updateDepartment
  );
  const deleteDepartment = useDepartmentStore(
    (state) => state.deleteDepartment
  );

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments, refresh]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Submitting Department Name:", departmentName); // Debug log

    if (editingId) {
      await updateDepartment(editingId, { name: departmentName });
    } else {
      await createDepartment({ name: departmentName });
    }

    resetForm();
    setIsDrawerOpen(false);
    setRefresh(!refresh);
  };

  const handleEdit = (department: Department) => {
    setEditingId(department.department_id);
    setDepartmentName(department.name);
    setIsDrawerOpen(true);
  };

  const handleDelete = async (departmentId: number) => {
    await deleteDepartment(departmentId);
    setRefresh(!refresh);
  };

  const resetForm = () => {
    setEditingId(null);
    setDepartmentName("");
  };

  return (
    <div className="container mx-auto mt-4">
      <h2 className="text-2xl font-semibold mb-4">Departments</h2>
      <Button
        onClick={() => {
          resetForm();
          setIsDrawerOpen(true);
        }}
        variant="outline"
        size="sm"
      >
        Add Department
      </Button>
      <div className="grid grid-cols-1 gap-4 mt-4">
        {Array.isArray(departments) ? (
          departments.map((department) => (
            <Card key={department.department_id} className="mb-4">
              <CardHeader>
                <CardTitle
                  className="cursor-pointer"
                  onClick={() => handleEdit(department)}
                >
                  {department.name}
                </CardTitle>
              </CardHeader>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(department)}
                >
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete the department.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(department.department_id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardFooter>
            </Card>
          ))
        ) : (
          <p>No departments available.</p>
        )}
      </div>

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>
              {editingId ? "Edit Department" : "Add Department"}
            </DrawerTitle>
            <DrawerDescription>
              {editingId
                ? "Update the department details below."
                : "Enter the details for the new department."}
            </DrawerDescription>
          </DrawerHeader>
          <form onSubmit={handleSubmit} className="p-4">
            <div className="space-y-4">
              <Input
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                placeholder="Department Name"
                required
              />
              <Button type="submit">
                {editingId ? "Update" : "Create"} Department
              </Button>
            </div>
          </form>
          <DrawerClose />
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default DepartmentComponent;
