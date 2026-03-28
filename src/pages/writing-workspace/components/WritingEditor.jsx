import React, { useRef, useEffect } from 'react';


const WritingEditor = ({ content, onChange, onSelectionChange, placeholder }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef?.current) {
      editorRef?.current?.focus();
    }
  }, []);

  const handleInput = (e) => {
    onChange(e?.target?.value);
  };

  const handleSelect = () => {
    if (editorRef?.current) {
      const start = editorRef?.current?.selectionStart;
      const end = editorRef?.current?.selectionEnd;
      const selectedText = content?.substring(start, end);
      onSelectionChange(selectedText, start, end);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <textarea
          ref={editorRef}
          value={content}
          onChange={handleInput}
          onSelect={handleSelect}
          placeholder={placeholder}
          className="w-full h-full min-h-[500px] p-6 lg:p-8 bg-transparent text-foreground text-base lg:text-lg leading-relaxed resize-none border-none outline-none focus:ring-0 placeholder:text-muted-foreground"
          spellCheck="true"
        />
      </div>
    </div>
  );
};

export default WritingEditor;