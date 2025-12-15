import { useEffect, useRef } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

export default function QuillEditor({ value = "", onChange }) {
  const editorRef = useRef(null);
  const quillInstance = useRef(null);

  useEffect(() => {
    if (!editorRef.current || quillInstance.current) return;

    const toolbarOptions = [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      [{ align: [] }],
      ["clean"],
    ];

    // Initialize Quill
    const quill = new Quill(editorRef.current, {
      theme: "snow",
      modules: {
        toolbar: toolbarOptions,
      },
    });

    // Set initial value
    quill.root.innerHTML = value || "";

    // Handle change
    quill.on("text-change", () => {
      const html = quill.root.innerHTML;
      onChange?.(html);
    });

    quillInstance.current = quill;

    return () => {
      quill.off("text-change", () => {});
      // quillInstance.current = null;
    };
  }, []);

  // If external value changes, update Quill content
  useEffect(() => {
    if (!quillInstance.current) return;
    const quill = quillInstance.current;
    if (value !== quill.root.innerHTML) {
      const selection = quill.getSelection();
      quill.root.innerHTML = value || "";
      if (selection) quill.setSelection(selection);
    }
  }, [value]);

  return (
    <div className="w-full">
      <div ref={editorRef} className="bg-white min-h-[200px] font-ibm-plex-sans!"></div>
    </div>
  );
}
