import { useState } from "react";
import { m as motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";

interface StoryFrame {
  id: string;
  emoji: string;
  text: string;
  animation?: string;
}

interface EmojiStoryTellingProps {
  initialStory?: StoryFrame[];
  onSave?: (story: StoryFrame[]) => void;
}

export function EmojiStoryTelling({ initialStory = [], onSave }: EmojiStoryTellingProps) {
  const [frames, setFrames] = useState<StoryFrame[]>(initialStory);
  const [currentFrame, setCurrentFrame] = useState<number>(0);
  const [isEditing, setIsEditing] = useState(false);

  const addFrame = () => {
    const newFrame: StoryFrame = {
      id: Date.now().toString(),
      emoji: "😊",
      text: "",
    };
    setFrames([...frames, newFrame]);
    setCurrentFrame(frames.length);
    setIsEditing(true);
  };

  const updateFrame = (id: string, updates: Partial<StoryFrame>) => {
    setFrames(frames.map(frame => 
      frame.id === id ? { ...frame, ...updates } : frame
    ));
  };

  const removeFrame = (id: string) => {
    setFrames(frames.filter(frame => frame.id !== id));
    if (currentFrame >= frames.length - 1) {
      setCurrentFrame(Math.max(0, frames.length - 2));
    }
  };

  const handleSave = () => {
    onSave?.(frames);
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>互動式表情符號故事</span>
          <Button variant="outline" size="icon" onClick={addFrame}>
            <Plus className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Story Display/Preview */}
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative">
            <AnimatePresence mode="wait">
              {frames[currentFrame] && (
                <motion.div
                  key={frames[currentFrame].id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="text-center"
                >
                  <div className="text-6xl mb-4">{frames[currentFrame].emoji}</div>
                  <p className="text-xl">{frames[currentFrame].text}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCurrentFrame(prev => Math.max(0, prev - 1))}
              disabled={currentFrame === 0}
            >
              上一頁
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentFrame(prev => Math.min(frames.length - 1, prev + 1))}
              disabled={currentFrame === frames.length - 1}
            >
              下一頁
            </Button>
          </div>

          {/* Editor */}
          {isEditing && frames[currentFrame] && (
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Input
                  value={frames[currentFrame].emoji}
                  onChange={(e) => updateFrame(frames[currentFrame].id, { emoji: e.target.value })}
                  placeholder="輸入表情符號"
                  className="w-24"
                />
                <Textarea
                  value={frames[currentFrame].text}
                  onChange={(e) => updateFrame(frames[currentFrame].id, { text: e.target.value })}
                  placeholder="輸入故事內容..."
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFrame(frames[currentFrame].id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Edit/Save Controls */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "預覽" : "編輯"}
            </Button>
            {isEditing && (
              <Button onClick={handleSave}>
                儲存故事
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
