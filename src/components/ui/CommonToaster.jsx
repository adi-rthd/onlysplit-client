import { Toaster } from 'react-hot-toast';

export default function CommonToaster() {
    return (
        <>
            <Toaster
                position="top-right"
                reverseOrder={false}
                gutter={20}
                toastOptions={{
                    duration: 3000,

                    style: {
                        background: '#111111',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '10px',
                        padding: '20px 24px',

                        width: 'fit-content',
                        minWidth: '300px',
                        maxWidth: '90vw',

                        whiteSpace: 'nowrap',
                    },
                }}
            /></>
    )
}