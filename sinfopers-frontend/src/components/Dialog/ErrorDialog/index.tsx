import { AlertCircle } from "lucide-react";

interface Props {
  message: string;
}

const ErrorDialog = ({ message }: Props) => {
  // Split pesan berdasarkan baris baru
  const messageLines = message.split('\n');
  
  // Filter empty lines and group messages by section
  const filteredLines = messageLines.filter(line => line.trim() !== '');

  return (
    <div className="flex flex-col items-center">
      <AlertCircle className="h-16 w-16 mb-4 text-red-500" />
      <h1 className="font-bold text-xl text-blue-950 mb-3">Tidak Dapat Menyimpan Data</h1>
      
      <div className="text-left w-full bg-red-50 p-4 rounded-lg border border-red-200">
        {filteredLines.map((line, index) => {
          // Heading style for the first line that's not a bullet point
          if (index === 0 && !line.startsWith('-')) {
            return (
              <p key={index} className="text-blue-950 font-medium mb-3">
                {line}
              </p>
            );
          }
          
          // Style for bullet points
          if (line.startsWith('-')) {
            return (
              <p key={index} className="text-blue-950 mb-1 pl-4">
                {line}
              </p>
            );
          }
          
          // Empty line for separation
          if (line.trim() === '') {
            return <div key={index} className="h-2"></div>;
          }
          
          // Normal paragraph
          return (
            <p key={index} className="text-blue-950 mb-2">
              {line}
            </p>
          );
        })}
      </div>
    </div>
  );
};

export default ErrorDialog;
