import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface Mood {
  emoji: string;
  name: string;
  description: string;
}

const moods: Mood[] = [
  { emoji: "😊", name: "happy", description: "我感到開心且充滿學習動力" },
  { emoji: "🤔", name: "confused", description: "這個概念有點困難，需要更多解釋" },
  { emoji: "😌", name: "satisfied", description: "我理解了，感覺很有成就感" },
  { emoji: "😅", name: "challenged", description: "有挑戰性，但我願意繼續嘗試" },
  { emoji: "😴", name: "tired", description: "需要休息一下" },
];

interface MoodTrackerProps {
  toolId: number;
}

export function MoodTracker({ toolId }: MoodTrackerProps) {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [intensity, setIntensity] = useState<number>(3);
  const [notes, setNotes] = useState("");
  const { toast } = useToast();

  const submitMutation = useMutation({
    mutationFn: async (data: {
      toolId: number;
      emoji: string;
      mood: string;
      intensity: number;
      notes?: string;
    }) => {
      const response = await fetch("/api/mood-entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to submit mood");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "心情已記錄",
        description: "感謝您的回饋！",
      });
      setSelectedMood(null);
      setIntensity(3);
      setNotes("");
    },
    onError: () => {
      toast({
        title: "提交失敗",
        description: "請稍後再試",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!selectedMood) return;

    submitMutation.mutate({
      toolId,
      emoji: selectedMood.emoji,
      mood: selectedMood.name,
      intensity,
      notes: notes || undefined,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>你現在的學習心情如何？</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-6">
          {moods.map((mood) => (
            <motion.div
              key={mood.name}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant={selectedMood?.name === mood.name ? "default" : "outline"}
                className="w-full h-full aspect-square text-2xl"
                onClick={() => setSelectedMood(mood)}
                aria-label={mood.description}
              >
                {mood.emoji}
              </Button>
            </motion.div>
          ))}
        </div>

        {selectedMood && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {selectedMood.description}
              </label>
              <Slider
                value={[intensity]}
                min={1}
                max={5}
                step={1}
                onValueChange={([value]) => setIntensity(value)}
                className="w-full"
                aria-label="選擇強度"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>較弱</span>
                <span>較強</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                想要說些什麼嗎？（選填）
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="分享你的想法..."
                className="resize-none"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              className="w-full"
            >
              {submitMutation.isPending ? "記錄中..." : "記錄心情"}
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
