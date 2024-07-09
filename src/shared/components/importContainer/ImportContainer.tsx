import React, { useState, useCallback } from 'react';
import { FlexCol, FlexRow } from '../flexbox/FlexBox';
import styles from '../../../../src/shared/components/query/styles/styles.module.scss';
import classNames from 'classnames';
import './ImportContainer.css'; // Ensure you have this CSS file
import { getLoadConfig } from 'config/config';

export default function ImportContainer() {
    const extn_base_Url =
        'https://wl2.dev2.gravity.invisibl.io/scitools/ds1/apps/crbioportal-apiserver';
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [dragging, setDragging] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
    const [uploadComplete, setUploadComplete] = useState<boolean>(false);
    const [error, setError] = useState<boolean>(false);
    const [message, setMessage] = useState<string>('');

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleDragOver = useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            setDragging(true);
        },
        []
    );

    const handleDragLeave = useCallback(
        (event: React.DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            setDragging(false);
        },
        []
    );

    const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragging(false);
        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
            setSelectedFile(event.dataTransfer.files[0]);
        }
    }, []);

    const handleDropZoneClick = () => {
        const fileUploadElement = document.getElementById('file-upload');
        if (fileUploadElement) {
            fileUploadElement.click();
        }
    };
    console.log(`${extn_base_Url}/api/studies/upload`);
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!selectedFile) {
            setMessage('Import failed. Please try again.');
            setError(true);
            return;
        }
        setMessage('Import in progress. Please wait…');
        setLoading(true);
        setSnackbarOpen(true);
        setUploadComplete(false);

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await fetch(
                `${extn_base_Url}/api/studies/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            if (response.ok) {
                setMessage('Import completed successfully');
                setLoading(false);
                setSnackbarOpen(true);
                setUploadComplete(true);
                // Keep the snackbar open for a bit longer to show the completion message
                setTimeout(() => {
                    setSnackbarOpen(false);
                    setSelectedFile(null);
                    setMessage('');
                    setError(false);
                    setUploadComplete(false);
                    setLoading(false);
                    formData.delete('file');
                }, 2000); // Adjust the delay as needed
            } else {
                setMessage('File upload failed. Please try again.');
                setLoading(false);
                setSnackbarOpen(true);
                setError(true);
                setTimeout(() => {
                    setSnackbarOpen(false);
                    setSelectedFile(null);
                    setMessage('');
                    setError(false);
                    formData.delete('file');
                }, 2000); // Adjust the delay as needed
                // alert('File upload failed. Please try again.');
            }
        } catch (error) {
            setMessage('File upload failed. Please try again.');
            setLoading(false);
            setError(true);
            setSnackbarOpen(true);
            setTimeout(() => {
                setSnackbarOpen(false);
                setSelectedFile(null);
                setMessage('');
                setError(false);
                formData.delete('file');
            }, 2000); // Adjust the delay as needed
        }
    };

    return (
        <>
            <div
                className={classNames('small', styles.QueryContainer)}
                style={{
                    alignItems: 'center',
                    justifyItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                }}
            >
                <form
                    action="#"
                    method="POST"
                    encType="multipart/form-data"
                    onSubmit={handleSubmit}
                >
                    <FlexCol
                        padded
                        overflow
                        style={{
                            background: '#fff',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '2px',
                            boxShadow: '0 0 1px #e9e9e9',
                            alignItems: 'center',
                            justifyItems: 'center',
                            width: '100%',
                            height: '850px',
                        }}
                    >
                        <FlexRow
                            style={{
                                width: '50%',
                                textAlign: 'center',
                            }}
                        >
                            <br />
                            {!selectedFile && (
                                <div
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        height: '270px',
                                    }}
                                >
                                    <input
                                        type="file"
                                        id="file-upload"
                                        style={{ display: 'none' }}
                                        onChange={handleFileChange}
                                    />
                                    <div
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        onClick={handleDropZoneClick}
                                        style={{
                                            border: dragging
                                                ? '2px dashed #000'
                                                : '2px dashed #ccc',
                                            borderRadius: '4px',
                                            padding: '10px',
                                            textAlign: 'center',
                                            display: 'flex',
                                            justifyContent: 'center', // Center horizontally
                                            alignItems: 'center', // Center vertically
                                            marginTop: '10px',
                                            cursor: 'pointer',
                                            height: '80%',
                                            width: '100%',
                                            fontSize: '18px',
                                        }}
                                    >
                                        {dragging ? (
                                            <p>Drop your file here...</p>
                                        ) : (
                                            <p>
                                                To Import a new study, Drag and
                                                Drop a file or{' '}
                                                <span
                                                    style={{
                                                        textDecoration:
                                                            'underline',
                                                        color: 'blue',
                                                    }}
                                                >
                                                    click to select a file
                                                </span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </FlexRow>
                        {selectedFile && (
                            <div style={{ fontSize: '18px' }}>
                                <p>Selected File: {selectedFile.name}</p>
                                <button
                                    type="submit"
                                    data-test="modifyStudySelectionButton"
                                    className={'btn btn-primary'}
                                    style={{
                                        marginLeft: '20px',
                                        fontSize: '18px',
                                    }}
                                >
                                    Import File
                                </button>
                            </div>
                        )}
                    </FlexCol>
                </form>
            </div>

            {snackbarOpen && (
                <div className="snackbar">
                    {loading ? (
                        <>
                            <div className="spinner"></div>
                            <div
                                style={{ paddingLeft: '5px', fontSize: '18px' }}
                            >
                                {/* Import in progress. Please wait… */}
                                {message}
                            </div>
                        </>
                    ) : uploadComplete ? (
                        <>
                            <div className="success-icon">
                                <svg viewBox="0 0 24 24">
                                    <path d="M9 16.2l-3.5-3.5 1.4-1.4L9 13.4l7.1-7.1 1.4 1.4L9 16.2z" />
                                </svg>
                            </div>
                            <span style={{ fontSize: '18px' }}>
                                {/* Import completed successfully */}
                                {message}
                            </span>
                        </>
                    ) : error ? (
                        <>
                            <div className="error-icon">
                                <svg viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                                </svg>
                            </div>
                            <span style={{ fontSize: '18px' }}>{message}</span>
                        </>
                    ) : null}
                </div>
            )}
        </>
    );
}
