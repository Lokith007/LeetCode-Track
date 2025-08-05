'use client';

import { useRef, useState, useCallback } from 'react';
import Papa from 'papaparse';
import { gql, useMutation } from '@apollo/client';

interface Student {
  username: string;
  realname: string;
  rollnumber: string;
  section: string;
}

// GraphQL Mutation
const UPLOAD_STUDENTS = gql`
  mutation UploadStudents($batch: String!, $students: [StudentInput!]!) {
    uploadStudents(batch: $batch, students: $students)
  }
`;

export default function CsvUploader({ batch }: { batch: string }) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadStudents, { loading, error }] = useMutation(UPLOAD_STUDENTS);

  const clean = (value?: string): string => {
    if (!value) return '';
    return value
      .trim()
      .replace(/^"(.*)"$/g, '$1')
      .replace(/[^a-zA-Z0-9\s_-]/g, '')
      .trim();
  };

  const parseCSV = useCallback((file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => header.trim().toLowerCase(),
      complete: async function (results: Papa.ParseResult<Record<string, string>>) {
        const students: Student[] = results.data
          .map((row: Record<string, string>) => ({
            username: clean(row['username']),
            realname: clean(row['realname']),
            rollnumber: clean(row['roll number']),
            section: clean(row['section']),
          }))
          .filter((s: Student) => s.username !== '');

        const invalidCount = results.data.length - students.length;
        if (invalidCount > 0) {
          console.warn(`${invalidCount} student(s) skipped due to empty username`);
        }

        console.log('Parsed students:', students);

        try {
          const res = await uploadStudents({
            variables: {
              batch: batch,
              students,
            },
          });
          console.log('Upload success:', res.data.uploadStudents);
          alert('CSV uploaded successfully!');
        } catch (err) {
          console.error('Upload failed:', err);
          alert('Failed to upload students.');
        }
      }

    });
  }, [uploadStudents, batch]);

  const handleButtonClick = () => {
    setShowModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length) {
      Array.from(files).forEach(parseCSV);
      setShowModal(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length) {
      Array.from(e.dataTransfer.files).forEach(parseCSV);
      setShowModal(false);
    }
  }, [parseCSV]);

  return (
    <div className="p-6 rounded-lg shadow-md max-w-md mx-auto mt-10 text-center">
      <button
        onClick={handleButtonClick}
        className="w-12 h-12 flex items-center justify-center rounded-full bg-orange-200 text-orange-700 text-2xl font-bold hover:bg-orange-300 transition"
        aria-label="Add CSV"
      >
        +
      </button>

      <input
        type="file"
        accept=".csv"
        multiple
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {showModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            className={`w-96 h-60 flex flex-col items-center justify-center border-4 border-dashed transition rounded-xl
              ${isDragOver ? 'bg-orange-100 border-orange-400' : 'bg-gray-100 border-gray-400'}`}
          >
            <p className="text-lg font-semibold text-gray-700">
              {isDragOver ? 'Drop the files here...' : 'Drag and drop your CSV here'}
            </p>
            <p className="text-sm text-gray-500 mt-2">or click below to upload</p>
            <button
              className="mt-4 px-4 py-2 bg-orange-400 text-white rounded-lg hover:bg-orange-500 transition"
              onClick={() => fileInputRef.current?.click()}
            >
              Browse Files
            </button>
            <button
              className="mt-2 text-sm text-gray-600 underline"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading && <div className="mt-6 flex justify-center">
        <div className="w-8 h-8 border-4 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
      </div>}
      {error && <p className="text-sm text-red-600 mt-4">Upload failed. Please try again.</p>}
    </div>
  );
}
