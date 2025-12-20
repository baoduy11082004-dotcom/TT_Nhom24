export default function Loading() {
  return (
    <div className="flex items-center justify-center h-full w-full p-10">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-500" />
        <p className="text-gray-500 text-sm">Đang tải danh sách...</p>
      </div>
    </div>
  );
}
