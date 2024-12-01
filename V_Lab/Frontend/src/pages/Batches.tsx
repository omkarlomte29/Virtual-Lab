import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "../components/ui/drawer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import useFacultyStore from "../store/facultyStore"; // Import the faculty store
import { useBatchStore } from "../store/batchStore";

const AddDivisionBatch: React.FC = () => {
  const { departments, fetchDepartments } = useFacultyStore();

  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [semester, setSemester] = useState<string>("");
  const [division, setDivision] = useState<string>("");
  const [batch, setBatch] = useState<string>("");
  const [addedBatches, setAddedBatches] = useState<any[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { createBatch, fetchBatches } = useBatchStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  useEffect(() => {
    fetchAddedBatches();
  }, []);

  const fetchAddedBatches = async () => {
    try {
      await fetchBatches(); // This will now update the state
      setError(null); // Reset error state if successful
    } catch (error) {
      console.error("Failed to fetch added batches:", error);
      setError("Failed to fetch added batches. Please try again later."); // User-friendly error message
    }
  };

  const handleAddBatch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const batchData = {
      department_id: parseInt(selectedDepartment, 10),
      semester: Number(semester), // Convert to number if needed
      division: division,
      batch: batch,
    };

    try {
      await createBatch(batchData);
      console.log("Batch created successfully");
      setIsDrawerOpen(false);
      await fetchAddedBatches(); // Fetch updated batches
      resetForm(); // Reset the form fields
    } catch (error) {
      console.error("Failed to add batch:", error);
      setError("Failed to add batch. Please check your input and try again.");
    }
  };

  const resetForm = () => {
    setSelectedDepartment("");
    setSemester("");
    setDivision("");
    setBatch("");
  };

  return (
    <div className="container mx-auto mt-4">
      <h2 className="text-2xl font-semibold mb-4">Add Divisions and Batches</h2>
      <Button onClick={() => setIsDrawerOpen(true)} variant="outline" size="sm">
        Open Batch Form
      </Button>

      {/* <Card className="mt-4">
        <CardHeader>
          <CardTitle>Added Batches and Divisions</CardTitle>
        </CardHeader>
        <CardContent>
          {addedBatches.length > 0 ? (
            <ul>
              {addedBatches.map((b) => (
                <li key={b.batch_id}>
                  Division: {b.division}, Batch: {b.batch}, Semester: {b.semester}
                </li>
              ))}
            </ul>
          ) : (
            <p>No batches added yet.</p>
          )}
        </CardContent>
      </Card> */}

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Add New Batch</DrawerTitle>
            <DrawerDescription>
              Fill in the details below to add a new batch.
            </DrawerDescription>
          </DrawerHeader>
          <form onSubmit={handleAddBatch} className="p-4">
            <div className="space-y-4">
              <label className="block">Department:</label>
              <select
                name="department"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="border rounded-md p-2 w-full"
                required
              >
                <option value="">Select Department</option>
                {departments.map((dept: any) => (
                  <option key={dept.department_id} value={dept.department_id}>
                    {dept.name}
                  </option>
                ))}
              </select>

              <label className="block">Semester:</label>
              <Input
                type="number"
                name="semester"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                placeholder="Enter Semester"
                required
              />

              <label className="block">Division:</label>
              <Input
                type="text"
                name="division"
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                placeholder="Enter Division (e.g., A, B, C)"
                required
              />

              <label className="block">Batch:</label>
              <Input
                type="number"
                name="batchName"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                placeholder="Enter Batch (e.g., 1, 2, 3)"
                required
              />

              <Button type="submit">Add Batch</Button>
            </div>
          </form>

          <DrawerClose />
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default AddDivisionBatch;
