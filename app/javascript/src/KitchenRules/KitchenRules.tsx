import React from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  content: string;
}

const KitchenRules: React.FC<Props> = ({ content }) => {
  return (
    <div className="page-island kitchen-rules">
      <a href="/kitchens" className="kitchen-rules__back">← Kitchen Reservations</a>
      <div className="kitchen-rules__body">
        <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
      </div>
    </div>
  );
};

export default KitchenRules;
