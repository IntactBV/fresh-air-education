import type { FC } from 'react';

interface IconUploadProps {
    className?: string;
}

const IconUpload: FC<IconUploadProps> = ({ className }) => {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path
                opacity="0.5"
                d="M17 15C19.175 14.9879 20.3529 14.8914 21.1213 14.123C22 13.2443 22 11.8301 22 9.00167V8.00167C22 5.17324 22 3.75896 21.1213 2.88028C20.2426 2.0016 18.8284 2.0016 16 2.0016H8C5.17157 2.0016 3.75736 2.0016 2.87868 2.88028C2 3.75896 2 5.17324 2 8.00167L2 9.00167C2 11.8301 2 13.2443 2.87868 14.123C3.64706 14.8914 4.82497 14.9879 7 15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <path
                d="M12 22L12 9M12 9L9 12.5M12 9L15 12.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

export default IconUpload;
