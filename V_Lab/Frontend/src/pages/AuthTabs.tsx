import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useDepartmentStore } from "../store/departmentStore";
// import { useBatchStore } from "../store/batchStore";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Skeleton } from "../components/ui/skeleton";
import { toast } from "../components/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getBatchesByDepartmentAndSemeter } from "@/services/api";
import { Batch } from "@/utils/types";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  // role: z.enum(["Student", "Faculty", "HOD"]),
  department_id: z.string(),
  semester: z.string().optional(),
  division: z.string().optional(),
  batch_id: z.string().optional(),
  roll_id: z.string().optional(),
});

const AuthTabs: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");

  const navigate = useNavigate();
  const { login, register } = useAuthStore();
  const { departments, fetchDepartments } = useDepartmentStore();
  // const { batches, fetchBatches } = useBatchStore();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchDepartments()]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchDepartments]);

  const fetchBatchData = async () => {
    if (selectedDepartment && selectedSemester) {
      try {
        const response = await getBatchesByDepartmentAndSemeter(
          parseInt(selectedDepartment),
          parseInt(selectedSemester)
        );
        setBatches(response.data);
      } catch (error) {
        console.error("Error fetching batch data:", error);
        setBatches([]);
      }
    }
  };

  useEffect(() => {
    fetchBatchData();
  }, [selectedDepartment, selectedSemester]);

  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value);
    registerForm.setValue("department_id", value);
    registerForm.setValue("semester", "");
    registerForm.setValue("division", "");
    registerForm.setValue("batch_id", "");
    console.log(registerForm.getValues("username"));
    setSelectedSemester("");
    setBatches([]);
  };

  const handleSemesterChange = (value: string) => {
    setSelectedSemester(value);
    registerForm.setValue("semester", value);
    registerForm.setValue("division", "");
    registerForm.setValue("batch_id", "");
  };

  // const divisionOptions = batches
  //   .filter(
  //     (b) =>
  //       b.department_id.toString() === department &&
  //       b.semester.toString() === semester
  //   )
  //   .map((b) => ({ value: b.division.toString(), label: b.division }));

  // const batchOptions = batches
  //   .filter(
  //     (b) =>
  //       b.department_id.toString() === department &&
  //       b.semester.toString() === semester &&
  //       b.division.toString() === division
  //   )
  //   .map((b) => ({ value: b.batch_id.toString(), label: b.batch }));

  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      await login(values.email, values.password);
      toast({
        title: "Login Successful",
        description: "You have been successfully logged in.",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Login Failed",
        variant: "destructive",
        description: "An error occurred during login. Please try again.",
      });
    }
  };

  const onRegisterSubmit = async (values: z.infer<typeof registerSchema>) => {
    try {
      await register(values);
      toast({
        title: "Registration Successful",
        description: "Your account has been created successfully.",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Registration Failed",
        variant: "destructive",
        description: "An error occurred during registration. Please try again.",
      });
    }
  };

  if (isLoading) {
    <div className="flex items-center justify-center h-full">
      <Skeleton className="w-[300px] h-[200px]" />;
    </div>;
    return;
  }

  return (
    <div className="flex items-center justify-center h-full">
      <Tabs defaultValue="login" className="w-6/12">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Card>
            <CardHeader>
              {/* <CardTitle>Login</CardTitle> */}
              <CardDescription className="flex items-center justify-center">
                Sign in to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...loginForm}>
                <form
                  onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                  className="space-y-8"
                >
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter your password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button className="w-full" type="submit">
                    Sign in
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="register">
          <Card>
            <CardHeader>
              {/* <CardTitle>Register</CardTitle> */}
              <CardDescription className="flex items-center justify-center">
                Create a new account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...registerForm}>
                <form
                  onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                  className="space-y-8"
                >
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter your password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* <FormField
                    control={registerForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Student">Student</SelectItem>
                            <SelectItem value="Faculty">Faculty</SelectItem>
                            <SelectItem value="HOD">HOD</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  /> */}
                  <FormField
                    control={registerForm.control}
                    name="department_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department</FormLabel>
                        <Select
                          onValueChange={handleDepartmentChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a department" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {departments.map((dep) => (
                              <SelectItem
                                key={dep.department_id}
                                value={dep.department_id.toString()}
                              >
                                {dep.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* {registerForm.watch("role") === "Student" && (
                    <> */}
                  <FormField
                    control={registerForm.control}
                    name="roll_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Roll ID</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your roll ID" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="semester"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Semester</FormLabel>
                        <Select
                          onValueChange={handleSemesterChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a semester" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from({ length: 8 }, (_, i) => (
                              <SelectItem key={i} value={(i + 1).toString()}>
                                Semester {i + 1}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="division"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Division</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a division" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {/* Filter to get unique divisions */}
                            {[...new Set(batches.map((b) => b.division))].map(
                              (division) => (
                                <SelectItem key={division} value={division}>
                                  {division}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="batch_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Batch</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a batch" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {/* Filter batches based on selected division */}
                            {batches
                              .filter(
                                (b) =>
                                  b.division === registerForm.watch("division")
                              )
                              .map((b) => (
                                <SelectItem
                                  key={b.batch_id}
                                  value={b.batch_id.toString()}
                                >
                                  {b.batch}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* </>
                  )} */}
                  <Button type="submit">Register</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuthTabs;
