import { Box, Modal } from "@mui/material"


const CustomModel = ({ open, setOpen, activeItem, component: Component, setRoute }) => {
    return (
        <Modal
            open={open}
            onClose={(event, reason) => {
                if (reason === 'backdropClick') {
                    return;
                }
                setOpen(false);
            }}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box
                className="
                fixed inset-0 w-screen h-screen bg-white dark:bg-slate-900 rounded-none p-4 sm:p-6 outline-none
                md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 
                md:w-[520px] lg:w-[640px] xl:w-[720px] md:max-w-[95vw] md:max-h-[90vh] lg:max-h-[85vh]
                md:rounded-[14px] md:border md:border-gray-200 md:dark:border-gray-800 md:shadow-xl md:p-5 lg:p-8
                "
                sx={{
                    msOverflowStyle: 'none',
                    scrollbarWidth: 'none',
                    '&::-webkit-scrollbar': { display: 'none' },
                }}
            >
                <button
                    aria-label="Close"
                    onClick={() => setOpen(false)}
                    className="absolute top-3 right-3 inline-flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path fillRule="evenodd" d="M6.225 4.811a1 1 0 0 1 1.414 0L12 9.172l4.361-4.361a1 1 0 1 1 1.414 1.414L13.414 10.586l4.361 4.361a1 1 0 0 1-1.414 1.414L12 12l-4.361 4.361a1 1 0 1 1-1.414-1.414l4.361-4.361-4.361-4.361a1 1 0 0 1 0-1.414Z" clipRule="evenodd" />
                    </svg>
                </button>
                <Box
                    className="h-full md:max-h-[calc(90vh-4rem)] lg:max-h-[calc(85vh-4rem)] overflow-y-auto pt-6 md:pt-0"
                    sx={{
                        msOverflowStyle: 'none',
                        scrollbarWidth: 'none',
                        '&::-webkit-scrollbar': { display: 'none' },
                    }}
                >
                    <Component setOpen={setOpen} setRoute={setRoute} />
                </Box>
            </Box>
        </Modal>
    )
}

export default CustomModel