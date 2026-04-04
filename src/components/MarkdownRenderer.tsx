import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Terminal, FileKey, Copy, Check } from 'lucide-react';
import { useArtifact } from '../context/ArtifactContext';

interface MarkdownRendererProps {
  content: string;
}

const ArtifactMarker = ({ type, data }: { type: string, data: any }) => {
  const { setActiveArtifact } = useArtifact();
  
  return (
    <button 
      onClick={() => setActiveArtifact({ type, data })}
      className="my-4 w-full py-4 px-6 bg-white border border-[#E5E5E5] hover:border-black rounded-[20px] shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group active:scale-[0.98]"
    >
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-start overflow-hidden">
           <span className="text-[14px] font-bold text-black tracking-[0.1em] uppercase">{type}</span>
           <span className="text-[11px] font-medium text-[#AAA] tracking-wide uppercase">Open Workspace</span>
        </div>
      </div>
      <div className="p-1 px-3 bg-[#F9F9F9] rounded-full border border-[#E5E5E5] group-hover:bg-black group-hover:text-white group-hover:border-black transition-all">
         <span className="text-[10px] font-bold uppercase tracking-widest">Active</span>
      </div>
    </button>
  );
};

const CodeCopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="p-1.5 bg-[#ffffff10] hover:bg-[#ffffff20] border border-[#ffffff20] bg-opacity-70 backdrop-blur-sm rounded-md transition-all flex items-center gap-1.5 text-[#ececf1]">
      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-white" />}
      <span className="text-[11px] font-medium">{copied ? 'Copied' : 'Copy code'}</span>
    </button>
  );
};

export const MarkdownRenderer = ({ content }: MarkdownRendererProps) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code(props) {
          const { children, className, node, ref, ...rest } = props;
          const match = /language-(\w+)/.exec(className || '');
          const language = match ? match[1] : '';
          
          if (language === 'quiz' || language === 'chart' || language === 'flashcard' || language === 'checklist') {
             const strContent = String(children).replace(/\n$/, '');
             try {
               const parsedData = JSON.parse(strContent);
               return <ArtifactMarker type={language} data={parsedData} />;
             } catch(e) {
               return null;
             }
          }

          if (language === 'insight' || language === 'summary') {
             const strContent = String(children).replace(/\n$/, '');
             
             let title = language === 'summary' ? "Summary Artifact" : "Key Document Insight";
             
             return (
               <div className="my-6 w-full max-w-full border border-[#d2d2d2] rounded-xl bg-white shadow-sm flex flex-col overflow-hidden transition-all duration-300 hover:shadow-md">
                 <div className="flex items-center px-4 py-2.5 bg-[#f5f5f5] border-b border-[#d2d2d2]">
                    <FileKey className="w-4 h-4 text-[#555] mr-2" />
                    <span className="font-bold text-[12px] tracking-wide text-[#333] uppercase">{title}</span>
                 </div>
                 <div className="p-6 text-[15.5px] leading-[1.7] text-[#1a1a1a] bg-white break-words">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{strContent}</ReactMarkdown>
                 </div>
               </div>
             );
          }

          if (!className) {
            return (
              <code {...rest} className="px-[6px] py-[2px] rounded-[6px] bg-[#f4f4f4] text-[#ea580c] font-mono text-[13.5px] border border-[#ececec]">
                {children}
              </code>
            );
          }

          return (
            <div className="my-6 rounded-2xl border border-[#1a1a1a] bg-[#1e1e1e] flex flex-col shadow-sm max-w-full overflow-hidden group/code">
               <div className="flex items-center justify-between px-4 py-2 border-b border-[#333] bg-[#2d2d2d]">
                 <div className="flex items-center">
                   <Terminal className="w-4 h-4 text-[#a8a8a8] mr-2" />
                   <span className="text-[13px] font-mono font-medium text-[#ececf1] tracking-wide">{language || 'code'}</span>
                 </div>
                 <CodeCopyButton text={String(children).replace(/\n$/, '')} />
               </div>
               <div className="overflow-x-auto bg-[#1e1e1e] max-w-full">
                 <SyntaxHighlighter
                   {...rest}
                   PreTag="div"
                   children={String(children).replace(/\n$/, '')}
                   language={language}
                   style={vscDarkPlus as any}
                   customStyle={{
                     margin: 0,
                     background: 'transparent',
                     padding: '20px',
                     fontSize: '14px',
                     lineHeight: '1.6',
                   }}
                 />
               </div>
            </div>
          );
        },
        h1: ({node, ...props}) => <h1 className="text-[24px] font-bold mt-8 mb-4 text-[#1a1a1a] tracking-tight" {...props} />,
        h2: ({node, ...props}) => <h2 className="text-[20px] font-bold mt-8 mb-4 text-[#1a1a1a] tracking-tight border-b border-[#eaeaea] pb-2" {...props} />,
        h3: ({node, ...props}) => <h3 className="text-[18px] font-semibold mt-6 mb-3 text-[#1a1a1a]" {...props} />,
        p: ({node, ...props}) => <p className="mb-4 text-[#212121] leading-[1.65] text-[15.5px] max-w-full break-words" {...props} />,
        ul: ({node, ...props}) => <ul className="mb-4 space-y-2.5 list-disc list-outside ml-6 text-[#212121] text-[15.5px]" {...props} />,
        ol: ({node, ...props}) => <ol className="mb-4 space-y-2.5 list-decimal list-outside ml-6 text-[#212121] text-[15.5px]" {...props} />,
        li: ({node, ...props}) => <li className="pl-1.5 leading-[1.65]" {...props} />,
        strong: ({node, ...props}) => <strong className="font-semibold text-[#000]" {...props} />,
        blockquote: ({node, ...props}) => (
          <blockquote className="border-l-[4px] border-[#e5e5e5] pl-5 py-0.5 my-5 text-[#666] text-[15.5px]" {...props} />
        ),
        table: ({node, ...props}) => (
          <div className="overflow-x-auto my-6 rounded-xl border border-[#e5e5e5] shadow-sm">
            <table className="w-full text-left border-collapse text-[14px]" {...props} />
          </div>
        ),
        thead: ({node, ...props}) => <thead className="bg-[#f8f8f8] border-b border-[#e5e5e5] text-[#666]" {...props} />,
        th: ({node, ...props}) => <th className="py-3 px-4 font-semibold text-black" {...props} />,
        td: ({node, ...props}) => <td className="py-3 px-4 border-b border-[#f0f0f0] text-[#333]" {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
};
