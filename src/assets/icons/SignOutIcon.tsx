import * as React from "react";

const SignOutIcon: React.FC<React.HTMLAttributes<HTMLOrSVGElement>> = props => (
    <svg
        xmlns='http://www.w3.org/2000/svg'
        width='20'
        height='20'
        fill='none'
        viewBox='0 0 20 20'
        {...props}
    >
        <g fill='currentColor' clipPath='url(#clip0_1031_8788)'>
            <path d='M9.563 12.5a.833.833 0 0 0-.833.833v2.5a2.5 2.5 0 0 1-2.5 2.5H4.167a2.5 2.5 0 0 1-2.5-2.5V4.167a2.5 2.5 0 0 1 2.5-2.5H6.23a2.5 2.5 0 0 1 2.5 2.5v2.5a.833.833 0 0 0 1.667 0v-2.5A4.17 4.17 0 0 0 6.23 0H4.167A4.17 4.17 0 0 0 0 4.167v11.666A4.17 4.17 0 0 0 4.167 20H6.23a4.17 4.17 0 0 0 4.167-4.167v-2.5a.833.833 0 0 0-.834-.833'></path>
            <path d='M19.057 8.233 15.236 4.41a.834.834 0 1 0-1.179 1.178l3.552 3.553L5 9.167a.833.833 0 0 0 0 1.666l12.657-.025-3.603 3.603a.834.834 0 1 0 1.179 1.178l3.821-3.821a2.5 2.5 0 0 0 .002-3.535'></path>
        </g>
        <defs>
            <clipPath id='clip0_1031_8788'>
                <path fill='#fff' d='M0 0h20v20H0z'></path>
            </clipPath>
        </defs>
    </svg>
);

export default SignOutIcon;
