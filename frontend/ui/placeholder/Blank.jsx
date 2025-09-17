export default function Blank({height, width}) {
  return <div className={`grow w-full h-full h-[${height ? height : "" }] w-[${width ? width : "" }] `}></div>;
}
