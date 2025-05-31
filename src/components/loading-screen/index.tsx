import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

const LoadingDots = () => {
  return (
    <div className="flex space-x-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-primary"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
};

const LoadingBar = () => {
  return (
    <div className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-primary"
        initial={{ width: "0%" }}
        animate={{ width: "100%" }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
    </div>
  );
};

const SkeletonCard = () => {
  return (
    <div className="p-4 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
      <div className="space-y-3">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
      </div>
    </div>
  );
};

export function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 1;
      });
    }, 30);

    return () => clearInterval(timer);
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn(
          "fixed inset-0 flex flex-col items-center justify-center",
          isDark ? "bg-gray-900" : "bg-white"
        )}
      >
        <div className="w-full max-w-md px-4 space-y-8">
          {/* Logo 和标题 */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <h1 className="text-2xl font-bold text-primary mb-2">CardOS</h1>
            <p className="text-gray-500 dark:text-gray-400">正在加载您的智能助手</p>
          </motion.div>

          {/* 进度条 */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.4 }}
            className="w-full"
          >
            <LoadingBar />
          </motion.div>

          {/* 加载动画 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex justify-center"
          >
            <LoadingDots />
          </motion.div>

          {/* 骨架屏预览 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-1 gap-4"
          >
            <SkeletonCard />
            <SkeletonCard />
          </motion.div>

          {/* 加载提示 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center text-sm text-gray-500 dark:text-gray-400"
          >
            <p>正在准备您的个性化体验</p>
            <p className="mt-1">{progress}%</p>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
} 