export default function getTime(
  time: Date | string | undefined,
): number | undefined {
  return time ? new Date(time).getTime() : undefined;
}
