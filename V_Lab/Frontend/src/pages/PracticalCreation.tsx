import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCourseStore } from "../store/courseStore";
import api from "../services/api";
import { Breadcrumb } from "../components/ui/breadcrumb";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { MultiSelect } from "../components/multi-select";
import { useToast } from "../components/hooks/use-toast";

interface TestCase {
  input: string;
  output: string;
  isPublic: boolean;
}

const PracticalCreation: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const course = useCourseStore((state) =>
    state.courses.find((c) => c.course_id.toString() === courseId)
  );

  const [srNo, setSrNo] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [programmingLanguages, setProgrammingLanguages] = useState<string[]>(
    []
  );
  const [testCases, setTestCases] = useState<TestCase[]>([
    { input: "", output: "", isPublic: false },
  ]);
  const [languageOptions, setLanguageOptions] = useState<
    { value: string; label: string }[]
  >([]);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await api.get("/programming-languages");
        setLanguageOptions(
          response.data.map((lang: any) => ({
            value: lang.programming_language_id.toString(),
            label: lang.language_name,
          }))
        );
      } catch (error) {
        console.error("Failed to fetch programming languages:", error);
        toast({
          title: "Error",
          description: "Failed to fetch programming languages",
          variant: "destructive",
        });
      }
    };
    fetchLanguages();
  }, [toast]);

  const handleTestCaseChange = (
    index: number,
    field: keyof TestCase,
    value: string | boolean
  ) => {
    const updatedTestCases = testCases.map((testCase, i) =>
      i === index ? { ...testCase, [field]: value } : testCase
    );
    setTestCases(updatedTestCases);
  };

  const addTestCase = () => {
    setTestCases([...testCases, { input: "", output: "", isPublic: false }]);
  };

  const removeTestCase = (index: number) => {
    setTestCases(testCases.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/practicals", {
        sr_no: parseInt(srNo),
        practical_name: title,
        description,
        pdf_url: pdfUrl,
        course_id: parseInt(courseId!),
        prac_io: testCases,
        prac_language: programmingLanguages.map((lang) => ({
          programming_language_id: parseInt(lang),
        })),
      });
      toast({
        title: "Success",
        description: "Practical created successfully!",
      });
      navigate(`/practicals/${courseId}`);
    } catch (error) {
      console.error("Failed to create practical:", error);
      toast({
        title: "Error",
        description: "Failed to create practical",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* <Breadcrumb>
        <Breadcrumb.Item href="/courses">Courses</Breadcrumb.Item>
        <Breadcrumb.Item href={`/course/${courseId}`}>
          {course?.course_name}
        </Breadcrumb.Item>
        <Breadcrumb.Item>New Practical</Breadcrumb.Item>
      </Breadcrumb> */}

      <h1 className="text-3xl font-bold mb-6">{course?.course_name}</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Create New Practical</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Sr No"
              type="number"
              value={srNo}
              onChange={(e) => setSrNo(e.target.value)}
              required
            />
            <Input
              placeholder="Title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <Textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <Input
              type="text"
              placeholder="PDF URL"
              value={pdfUrl}
              onChange={(e) => setPdfUrl(e.target.value)}
            />
            <MultiSelect
              placeholder="Programming Languages"
              options={languageOptions}
              onValueChange={setProgrammingLanguages}
              defaultValue={programmingLanguages}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Cases</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {testCases.map((testCase, index) => (
              <Card key={index}>
                <CardContent className="space-y-2">
                  <Textarea
                    placeholder="Input"
                    value={testCase.input}
                    onChange={(e) =>
                      handleTestCaseChange(index, "input", e.target.value)
                    }
                  />
                  <Textarea
                    placeholder="Output"
                    value={testCase.output}
                    onChange={(e) =>
                      handleTestCaseChange(index, "output", e.target.value)
                    }
                    required
                  />
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`public-${index}`}
                      checked={testCase.isPublic}
                      onCheckedChange={(checked) =>
                        handleTestCaseChange(
                          index,
                          "isPublic",
                          checked === true
                        )
                      }
                    />
                    <label htmlFor={`public-${index}`}>Public test case</label>
                  </div>
                  {index > 0 && (
                    <Button
                      variant="destructive"
                      onClick={() => removeTestCase(index)}
                    >
                      Remove Test Case
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </CardContent>
          <CardFooter>
            <Button type="button" onClick={addTestCase} variant="outline">
              Add Test Case
            </Button>
          </CardFooter>
        </Card>

        <Button type="submit">Create Practical</Button>
      </form>
    </div>
  );
};

export default PracticalCreation;
