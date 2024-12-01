import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPractical } from "../services/api";
import { Practical } from "../utils/types";
import { Button } from "./ui/button";

const PracticalList: React.FC = () => {
  const [practicals, setPracticals] = useState<Practical[]>([]);

  useEffect(() => {
    const fetchPracticals = async () => {
      try {
        const response = await getPractical(0); // Assuming 0 fetches all practicals
        setPracticals(response.data);
      } catch (error) {
        console.error("Failed to fetch practicals:", error);
      }
    };
    fetchPracticals();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {practicals.map((practical) => (
        <div
          key={practical.practical_id}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
        >
          <h3 className="text-lg font-semibold">{practical.practical_name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {practical.description}
          </p>
          <div className="mt-4">
            <Link to={`/practical-update/${practical.practical_id}`}>
              <Button variant="secondary">Edit</Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PracticalList;
