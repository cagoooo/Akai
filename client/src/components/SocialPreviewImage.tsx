import { type EducationalTool } from "@/lib/data";
import { useEffect, useRef } from "react";

interface SocialPreviewImageProps {
  tool: EducationalTool;
  onGenerate?: (dataUrl: string) => void;
}

export function SocialPreviewImage({ tool, onGenerate }: SocialPreviewImageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const generatePreview = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set canvas size for social media (1200x630 is optimal for most platforms)
      canvas.width = 1200;
      canvas.height = 630;

      // Draw background gradient based on tool category
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, "hsl(var(--background))");
      gradient.addColorStop(1, "hsl(var(--primary))");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add tool title
      ctx.font = "bold 60px system-ui";
      ctx.fillStyle = "hsl(var(--primary-foreground))";
      ctx.textAlign = "center";
      ctx.fillText(tool.title, canvas.width / 2, canvas.height / 2 - 40);

      // Add tool description
      ctx.font = "32px system-ui";
      ctx.fillStyle = "hsl(var(--primary-foreground)/0.8)";
      const words = tool.description.split(" ");
      let line = "";
      let lines: string[] = [];
      for (const word of words) {
        const testLine = line + word + " ";
        const metrics = ctx.measureText(testLine);
        if (metrics.width > canvas.width - 200) {
          lines.push(line);
          line = word + " ";
        } else {
          line = testLine;
        }
      }
      lines.push(line);

      lines.forEach((line, index) => {
        ctx.fillText(
          line.trim(),
          canvas.width / 2,
          canvas.height / 2 + 40 + index * 40
        );
      });

      // Convert canvas to data URL and call onGenerate
      const dataUrl = canvas.toDataURL("image/png");
      onGenerate?.(dataUrl);
    };

    generatePreview();
  }, [tool, onGenerate]);

  return (
    <canvas
      ref={canvasRef}
      className="hidden"
      aria-hidden="true"
    />
  );
}
