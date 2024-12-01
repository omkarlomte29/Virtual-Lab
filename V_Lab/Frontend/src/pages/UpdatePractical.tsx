import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
// import { useCourseStore } from "../store/courseStore";
import api from "../services/api";
// import { Breadcrumb } from "../components/ui/breadcrumb";
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
  prac_io_id?: number;
  input: string;
  output: string;
  isPublic: boolean;
}

interface PracticalData {
  practical_id: number;
  sr_no: number;
  practical_name: string;
  description: string;
  pdf_url: string;
  course_id: number;
  prac_io: TestCase[];
  prac_language: { programming_language_id: number }[];
}

const UpdatePractical: React.FC = () => {
  const { practicalId } = useParams<{ practicalId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [practical, setPractical] = useState<PracticalData | null>(null);
  const [languageOptions, setLanguageOptions] = useState<
    { value: string; label: string }[]
  >([]);

  useEffect(() => {
    const fetchPractical = async () => {
      try {
        const response = await api.get(`/practicals/${practicalId}`);
        setPractical(response.data);
      } catch (error) {
        console.error("Failed to fetch practical:", error);
        toast({
          title: "Error",
          description: "Failed to fetch practical",
          variant: "destructive",
        });
      }
    };

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

    fetchPractical();
    fetchLanguages();
  }, [practicalId, toast]);

  const handleInputChange = (
    field: keyof PracticalData,
    value: string | number
  ) => {
    if (practical) {
      setPractical({ ...practical, [field]: value });
    }
  };

  const handleTestCaseChange = (
    index: number,
    field: keyof TestCase,
    value: string | boolean
  ) => {
    if (practical) {
      const updatedTestCases = practical.prac_io.map((testCase, i) =>
        i === index ? { ...testCase, [field]: value } : testCase
      );
      setPractical({ ...practical, prac_io: updatedTestCases });
    }
  };

  const addTestCase = () => {
    if (practical) {
      setPractical({
        ...practical,
        prac_io: [
          ...practical.prac_io,
          { input: "", output: "", isPublic: false },
        ],
      });
    }
  };

  const removeTestCase = (index: number) => {
    if (practical) {
      setPractical({
        ...practical,
        prac_io: practical.prac_io.filter((_, i) => i !== index),
      });
    }
  };

  const handleLanguageChange = (selectedLanguages: string[]) => {
    if (practical) {
      setPractical({
        ...practical,
        prac_language: selectedLanguages.map((lang) => ({
          programming_language_id: parseInt(lang),
        })),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!practical) return;

    try {
      await api.put(`/practicals/${practicalId}`, practical);
      toast({
        title: "Success",
        description: "Practical updated successfully!",
      });
      navigate(`/course/${practical.course_id}`);
    } catch (error) {
      console.error("Failed to update practical:", error);
      toast({
        title: "Error",
        description: "Failed to update practical",
        variant: "destructive",
      });
    }
  };

  if (!practical) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* <Breadcrumb>
        <Breadcrumb.Item href="/courses">Courses</Breadcrumb.Item>
        <Breadcrumb.Item href={`/course/${practical.course_id}`}>
          Course
        </Breadcrumb.Item>
        <Breadcrumb.Item>Update Practical</Breadcrumb.Item>
      </Breadcrumb> */}

      <h1 className="text-3xl font-bold mb-6">Update Practical</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Practical Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Sr No"
              type="number"
              value={practical.sr_no}
              onChange={(e) =>
                handleInputChange("sr_no", parseInt(e.target.value))
              }
              required
            />
            <Input
              placeholder="Title"
              type="text"
              value={practical.practical_name}
              onChange={(e) =>
                handleInputChange("practical_name", e.target.value)
              }
              required
            />
            <Textarea
              placeholder="Description"
              value={practical.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              required
            />
            <Input
              placeholder="PDF URL"
              type="text"
              value={practical.pdf_url}
              onChange={(e) => handleInputChange("pdf_url", e.target.value)}
            />
            <MultiSelect
              placeholder="Programming Languages"
              options={languageOptions}
              onValueChange={handleLanguageChange}
              defaultValue={practical.prac_language.map((lang) =>
                lang.programming_language_id.toString()
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Cases</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {practical.prac_io.map((testCase, index) => (
              <Card key={index}>
                <CardContent className="space-y-2">
                  <Textarea
                    placeholder="Input"
                    value={testCase.input}
                    onChange={(e) =>
                      handleTestCaseChange(index, "input", e.target.value)
                    }
                    required
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
                  <Button
                    variant="destructive"
                    onClick={() => removeTestCase(index)}
                  >
                    Remove Test Case
                  </Button>
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

        <Button type="submit">Update Practical</Button>
      </form>
    </div>
  );
};

export default UpdatePractical;
