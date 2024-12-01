import React, { useEffect, lazy, Suspense } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import { useThemeStore } from "./store/themeStore";
import Layout from "./components/Layout";
import { Loader2 } from "lucide-react";

//Lazy load Components
const AuthTabs = lazy(() => import("./pages/AuthTabs"));
const Courses = lazy(() => import("./pages/Courses"));
const CourseAssign = lazy(() => import("./pages/CourseAssign"));
const PracticalCreation = lazy(() => import("./pages/PracticalCreation"));
const PracticalUpdate = lazy(() => import("./pages/PracticalUpdate"));

const PracticalSubmission = lazy(() => import("./pages/PracticalSubmission"));
const PracticalList = lazy(() => import("./pages/PracticalList"));
const Students = lazy(() => import("./pages/Students"));

const StudentSubmissions = lazy(() => import("./pages/StudentSubmissions"));
const FacultyDetails = lazy(() => import("./pages/Faculty"));
const CodingEnvironmentPage = lazy(() => import("./pages/CodeEnv1"));
const PracticalSubmissionDetails = lazy(
  () => import("./pages/PracticalSubmissionDetails")
);

const Department = lazy(() => import("./pages/Department"));
const Batches = lazy(() => import("./pages/Batches"));

const App: React.FC = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isDarkMode = useThemeStore((state) => state.isDarkMode);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <div className={`flex flex-col min-h-screen ${isDarkMode ? "dark" : ""}`}>
      <Router>
        <Layout>
          <div className="flex-grow">
            <Suspense
              fallback={
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                </>
              }
            >
              <Routes>
                <Route
                  path="/"
                  element={isAuthenticated ? <Courses /> : <AuthTabs />}
                />
                {/* <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} /> */}
                <Route path="/login" element={<AuthTabs />} />
                <Route path="/register" element={<AuthTabs />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/Students" element={<Students />} />
                <Route
                  path="/StudentSubmissions"
                  element={<StudentSubmissions />}
                />
                <Route
                  path="/course-assign/:courseId"
                  element={<CourseAssign />}
                />
                <Route
                  path="/practicals/:courseId"
                  element={<PracticalList />}
                />
                <Route
                  path="/practical-creation/:courseId"
                  element={<PracticalCreation />}
                />
                <Route
                  path="/practical-update/:courseId/:practicalId"
                  // element={<PracticalUpdate />}
                />
                <Route
                  path="/practical-submission/:courseId/:practicalId"
                  element={<PracticalSubmission />}
                />
                <Route
                  path="/practical-submission-details/:practicalId/:submissionId"
                  element={<PracticalSubmissionDetails />}
                />
                <Route
                  path="/coding/:courseId/:practicalId"
                  element={<CodingEnvironmentPage />}
                />
                <Route path="/batches" element={<PracticalList />} />
                <Route path="/Students" element={<Students />} />
                <Route
                  path="/StudentSubmissions/:studentId"
                  element={<StudentSubmissions />}
                />
                <Route path="/faculty" element={<FacultyDetails />} />
                <Route path="/departments" element={<Department />} />
                <Route path="/division" element={<Batches />} />

                <Route
                  path="/practicals/:courseId/:practicalId/edit"
                  element={<PracticalUpdate />}
                />
                {/* <Route
                path="/view-code/:submissionId"
                element={<ViewCodePage />}
              /> */}
                {/* <Route path="/dashboard" element={<Batch />} /> */}
              </Routes>
            </Suspense>
          </div>
        </Layout>
      </Router>
    </div>
  );
};

export default App;
