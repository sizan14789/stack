export default function Blank({height, width}) {
  return <div className={`grow w-full h-full h-[${height ? height : "" }] h-[${width ? width : "" }] `}></div>;
}
