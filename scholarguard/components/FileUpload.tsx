import React, { useCallback, useState } from 'react';
import { UploadCloud, FileText, X, Loader2 } from 'lucide-react';

interface FileUploadProps {
  onTextExtract: (text: string) => void;
  accept?: string;
  label?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onTextExtract, 
  accept = ".txt,.md,.pdf,.docx",
  label = "Upload Research Paper"
}) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const extractTextFromPDF = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      // Access global pdfjsLib injected via index.html script
      const pdfjsLib = (window as any).pdfjsLib;
      if (!pdfjsLib) throw new Error("PDF Library not loaded. Please refresh the page.");

      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + "\n\n";
      }

      return fullText;
    } catch (error) {
      console.error("PDF Extraction Error:", error);
      throw new Error("Failed to read PDF. It might be password protected or scanned image.");
    }
  };

  const handleFile = useCallback(async (file: File) => {
    setFileName(file.name);
    setIsProcessing(true);

    try {
      let text = "";
      // Check MIME type or file extension
      const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith('.pdf');
      
      if (isPdf) {
        text = await extractTextFromPDF(file);
      } else {
        // Fallback for text/md files
        text = await new Promise((resolve) => {
           const reader = new FileReader();
           reader.onload = (e) => resolve(e.target?.result as string);
           reader.readAsText(file);
        });
      }

      if (!text || text.trim().length === 0) {
        throw new Error("No text could be extracted. The file might be empty or an image-based PDF.");
      }

      onTextExtract(text);
    } catch (error: any) {
      alert(error.message || "Error processing file.");
      setFileName(null);
    } finally {
      setIsProcessing(false);
    }
  }, [onTextExtract]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full mb-6">
      <label 
        className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300
          ${dragActive ? 'border-scholar-gold bg-scholar-gold/5' : 'border-gray-300 bg-white hover:bg-gray-50'}
          ${fileName ? 'border-scholar-900/20 bg-scholar-900/5' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          {isProcessing ? (
             <div className="flex flex-col items-center text-scholar-900">
               <Loader2 className="w-10 h-10 animate-spin mb-2" />
               <p className="text-sm font-medium">Extracting text from document...</p>
             </div>
          ) : fileName ? (
            <>
              <FileText className="w-12 h-12 text-scholar-900 mb-3" />
              <p className="mb-2 text-sm text-scholar-900 font-semibold">{fileName}</p>
              <p className="text-xs text-gray-500">File loaded successfully</p>
              <button 
                onClick={(e) => { e.preventDefault(); setFileName(null); onTextExtract(''); }}
                className="mt-3 text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Remove
              </button>
            </>
          ) : (
            <>
              <UploadCloud className={`w-12 h-12 mb-3 ${dragActive ? 'text-scholar-gold' : 'text-gray-400'}`} />
              <p className="mb-2 text-sm text-gray-600 font-medium">{label}</p>
              <p className="text-xs text-gray-400">PDF, TXT, MD (Max 10MB)</p>
            </>
          )}
        </div>
        <input 
          type="file" 
          className="hidden" 
          accept={accept}
          onChange={handleChange}
        />
      </label>
    </div>
  );
};