import { type EducationalTool } from "@/lib/data";

interface PreviewGeneratorProps {
  tool: EducationalTool;
}

export function PreviewGenerator({ tool }: PreviewGeneratorProps) {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 800 450"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="800" height="450" fill="#f8f9fa" />
      <text
        x="400"
        y="225"
        fontFamily="system-ui"
        fontSize="24"
        fill="#6b7280"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {tool.title} Preview
      </text>
    </svg>
  );
}
