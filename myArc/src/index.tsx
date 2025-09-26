// ===================================================================================
// ※ [필수] 1단계: 딱 한 번만 설정해주세요.
// 아래 const firebaseConfig = {}; 부분에 Firebase에서 복사한 코드를 붙여넣으세요.
// 이 설정만 완료하면, 앞으로 코드를 직접 수정할 필요가 전혀 없습니다.
// ===================================================================================
const firebaseConfig: any = {
  apiKey: "AIzaSyAKpjIGvpThK-azseaI2uKQ6_Oee8HnIl4",
  authDomain: "myarchive-f9a72.firebaseapp.com",
  projectId: "myarchive-f9a72",
  storageBucket: "myarchive-f9a72.appspot.com",
  messagingSenderId: "125262608006",
  appId: "1:125262608006:web:5b4de2d256014dc6290307",
  measurementId: "G-2QKF83KWJZ"
};
// ===================================================================================


// React와 관련 라이브러리에서 필요한 기능들을 가져옵니다.
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createRoot } from 'react-dom/client';

// Firebase SDK(Software Development Kit)에서 필요한 함수들을 직접 가져옵니다.
// 이 방식은 스크립트 로딩 순서에 따른 오류(흰 화면 문제)를 원천적으로 방지합니다.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, doc, getDoc, setDoc, getDocs, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";


// Firebase 앱 초기화 및 서비스 인스턴스 생성
// firebaseConfig가 비어있지 않을 때만 초기화를 시도합니다.
let app, db, storage;
if (firebaseConfig && firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app); // Firestore 데이터베이스 인스턴스
    storage = getStorage(app); // Firebase 스토리지 인스턴스
} else {
    console.error("Firebase 설정이 비어있습니다. index.tsx 파일 상단에 firebaseConfig를 채워주세요.");
}


// AppStyles: 웹사이트의 전체적인 스타일(CSS)을 정의하는 컴포넌트입니다. (디자인 변경 시 여기를 수정)
const AppStyles = () => (
    <style>{`
        /* ... (이전과 동일한 CSS 코드) ... */
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap');
        :root {
            --background-color: #F0F4F8; --text-color: #2c3e50; --primary-color: #3498db;
            --white-color: #ffffff; --light-gray-color: #ecf0f1; --card-border-color: rgba(224, 230, 236, 0.8);
        }
        body { margin: 0; font-family: 'Noto Sans KR', sans-serif; background-color: var(--background-color); color: var(--text-color); }
        body.modal-open { overflow: hidden; }
        .container { max-width: 960px; margin: 0 auto; padding: 20px; position: relative; z-index: 2; }
        header { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; margin-bottom: 30px; position: relative; }
        .search-container { position: relative; flex-grow: 1; max-width: 400px; }
        .search-bar { display: flex; align-items: center; background-color: var(--white-color); border: 1px solid var(--card-border-color); border-radius: 8px; padding: 8px 12px; width: 100%; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .search-bar svg { color: #555; flex-shrink: 0; }
        .search-bar input { border: none; background: transparent; outline: none; width: 100%; font-size: 16px; margin-left: 10px; font-family: 'Noto Sans KR', sans-serif; }
        .autocomplete-suggestions { position: absolute; top: 100%; left: 0; right: 0; background: var(--white-color); border: 1px solid #ddd; border-radius: 0 0 8px 8px; list-style: none; margin: 0; padding: 0; z-index: 1001; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .autocomplete-suggestions li { padding: 10px 15px; cursor: pointer; }
        .autocomplete-suggestions li:hover { background-color: #f0f0f0; }
        .social-links { display: flex; align-items: center; gap: 20px; margin-left: 30px; }
        .social-links a { display: flex; align-items: center; gap: 8px; text-decoration: none; color: var(--text-color); font-weight: bold; font-size: 16px; transition: color 0.3s; }
        .social-links a:hover { color: var(--primary-color); }
        .profile-section { display: flex; justify-content: space-between; align-items: center; padding: 20px 0; gap: 30px; }
        .logo { flex-basis: 20%; display: flex; justify-content: center; }
        .logo img { width: 180px; transition: transform 0.3s ease; }
        .logo img:hover { transform: scale(1.05); }
        .profile-pic { width: 200px; height: 200px; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 20px; color: #333; flex-shrink: 0; object-fit: cover; object-position: center; border: 5px solid var(--white-color); box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        .profile-intro, .description-banner { background-color: rgba(255, 255, 255, 0.7); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid var(--card-border-color); border-radius: 20px; color: var(--text-color); padding: 20px; box-sizing: border-box; box-shadow: 0 4px 15px rgba(0,0,0,0.05); white-space: pre-wrap; }
        .profile-intro { width: 250px; height: 200px; display: flex; justify-content: center; align-items: center; font-size: 20px; text-align: center; flex-shrink: 0; }
        .description-banner { padding: 25px; text-align: center; font-size: 18px; margin: 30px 0; }
        .gallery { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
        .gallery-item { display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: transform 0.3s ease; }
        .gallery-item:hover { transform: translateY(-5px); }
        .gallery-item .thumbnail { width: 100%; aspect-ratio: 1 / 1; border-radius: 15px; margin-bottom: 10px; overflow: hidden; border: 1px solid #eee; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .gallery-item .thumbnail img, .gallery-item .thumbnail video { width: 100%; height: 100%; object-fit: cover; }
        .gallery-item .title { font-size: 14px; font-weight: bold; margin: 0; }
        .footer-wrapper { background-color: rgba(255, 255, 255, 0.8); border-top: 1px solid var(--card-border-color); margin-top: 40px; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); position: relative; z-index: 2; }
        footer { max-width: 960px; margin: 0 auto; padding: 40px 20px; text-align: center; color: #6c757d; font-size: 14px; position: relative; }
        .admin-button { position: absolute; bottom: 10px; right: 20px; background: none; border: 1px solid #6c757d; border-radius: 5px; color: #6c757d; padding: 5px 10px; cursor: pointer; font-size: 12px; }
        .admin-button:hover { background: #6c757d; color: white; }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.8); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 20px; }
        .modal-content { background-color: white; padding: 20px; border-radius: 10px; max-width: 90vw; max-height: 90vh; overflow-y: auto; position: relative; text-align: center; }
        .modal-content img, .modal-content video { max-width: 100%; max-height: 70vh; display: block; margin: 0 auto 15px auto; border-radius: 5px; }
        .modal-close-button { position: absolute; top: 15px; right: 15px; background: none; border: none; font-size: 24px; color: #333; cursor: pointer; }
        .admin-login-modal .modal-content { width: 300px; max-width: 80vw; }
        .admin-login-modal input { width: calc(100% - 20px); padding: 10px; margin: 15px 0; border-radius: 5px; border: 1px solid #ccc; }
        .admin-login-modal button[type="submit"] { width: 100%; padding: 10px; border: none; border-radius: 5px; background-color: #333; color: white; cursor: pointer; font-size: 16px; }
        .admin-login-modal .error { color: red; margin-top: 10px; }
        .admin-dashboard { padding: 20px; }
        .admin-dashboard h1, .admin-dashboard h2 { border-bottom: 2px solid #eee; padding-bottom: 10px; margin-bottom: 20px; }
        .admin-header { display: flex; justify-content: space-between; align-items: center; }
        .admin-header button { padding: 8px 15px; border: none; border-radius: 5px; background-color: #e74c3c; color: white; cursor: pointer; font-size: 14px; }
        .admin-section { background-color: #f9f9f9; border: 1px solid #eee; border-radius: 8px; padding: 20px; margin-bottom: 30px; }
        .form-group { margin-bottom: 15px; }
        .form-group label { display: block; margin-bottom: 5px; font-weight: bold; }
        .form-group input, .form-group textarea { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
        .form-group textarea { min-height: 100px; resize: vertical; }
        .form-group button { padding: 10px 20px; border: none; border-radius: 5px; background-color: #28a745; color: white; cursor: pointer; font-size: 16px; }
        .form-group .media-preview { max-width: 100px; max-height: 100px; margin-top: 10px; display: block; border: 1px solid #ddd; padding: 5px; object-fit: contain; }
        .manage-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        .manage-table th, .manage-table td { border: 1px solid #ddd; padding: 8px; text-align: left; word-wrap: break-word; }
        .manage-table th { background-color: #f2f2f2; }
        .manage-table .action-btn { color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; margin-right: 5px; }
        .manage-table .edit-btn { background-color: #007bff; }
        .manage-table .delete-btn { background-color: #dc3545; }
        .loading-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(255,255,255,0.8); display: flex; justify-content: center; align-items: center; z-index: 9999; font-size: 1.2em; }
        @media (max-width: 992px) { .gallery { grid-template-columns: repeat(3, 1fr); } .profile-section { gap: 20px; justify-content: center; flex-wrap: wrap; } .logo img { width: 150px; } .profile-pic { width: 180px; height: 180px; } .profile-intro { width: 220px; height: 180px; } }
        @media (max-width: 768px) { .gallery { grid-template-columns: repeat(2, 1fr); } header { flex-direction: column; gap: 15px; align-items: stretch; } .search-container { max-width: none; } .social-links { justify-content: flex-end; } .profile-section { flex-direction: column; gap: 20px; align-items: center; } .logo img { width: 140px; } .profile-pic { width: 160px; height: 160px; } .profile-intro { width: 90%; height: auto; min-height: 120px; } .manage-table { font-size: 12px; } .manage-table .action-btn { padding: 3px 6px; font-size: 10px; } }
        @media (max-width: 480px) { .gallery { grid-template-columns: 1fr; } .logo img { width: 120px; } .profile-pic { width: 120px; height: 120px; } .profile-intro { width: 100%; height: auto; min-height: 100px; font-size: 16px; } .description-banner { font-size: 16px; } }
    `}</style>
);

// BackgroundAnimation: 배경 애니메이션 컴포넌트 (이전과 동일)
const BackgroundAnimation = () => {
    const shapes = useMemo(() => Array.from({ length: 40 }).map((_, i) => ({ id: i, top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, animationDuration: `${25 + Math.random() * 40}s`, animationDelay: `${Math.random() * -65}s`, scale: 0.4 + Math.random() * 0.6 })), []);
    return (
        <div className="animated-background">
             <style>{`.animated-background { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; overflow: hidden; background-color: #F0F4F8; } @keyframes float { 0% { transform: translateY(10vh) rotate(0deg); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(-110vh) rotate(360deg); opacity: 0; } } .bg-shape { position: absolute; color: rgba(52, 152, 219, 0.15); animation-name: float; animation-timing-function: linear; animation-iteration-count: infinite; }`}</style>
             {shapes.map(shape => (<svg key={shape.id} className="bg-shape" style={{ top: shape.top, left: shape.left, transform: `scale(${shape.scale})`, animationDuration: shape.animationDuration, animationDelay: shape.animationDelay }} width="80" height="80" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7v10l10 5 10-5V7l-10-5z" /></svg>))}
        </div>
    );
};


// --- 컴포넌트 정의 ---

// Modal: 작품 클릭 시 나타나는 팝업창 컴포넌트 (이전과 동일)
const Modal = ({ item, onClose }) => {
    if (!item) return null;
    useEffect(() => {
        document.body.classList.add('modal-open');
        const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.classList.remove('modal-open');
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);
    return (
        <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-button" onClick={onClose} aria-label="닫기">&times;</button>
                {item.type === 'image' ? <img src={item.src} alt={item.title} /> : <video src={item.src} controls autoPlay />}
                <h3 id="modal-title">{item.title}</h3>
                <p>{item.description}</p>
            </div>
        </div>
    );
};

// AdminLoginModal: 관리자 로그인 모달 컴포넌트 (이전과 동일)
const AdminLoginModal = ({ onClose, onLoginSuccess }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    useEffect(() => {
        document.body.classList.add('modal-open');
        const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            document.body.classList.remove('modal-open');
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);
    const handleSubmit = (e) => {
        e.preventDefault();
        if (password === 'cham5038') onLoginSuccess();
        else setError('비밀번호가 올바르지 않습니다.');
    };
    return (
        <div className="modal-overlay admin-login-modal" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                 <button className="modal-close-button" onClick={onClose} aria-label="닫기">&times;</button>
                 <h3>관리자 로그인</h3>
                 <form onSubmit={handleSubmit}>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호" aria-label="비밀번호" autoFocus />
                    <button type="submit">로그인</button>
                    {error && <p className="error">{error}</p>}
                 </form>
            </div>
        </div>
    );
};

// EditItemModal: 작품 수정 모달 컴포넌트
const EditItemModal = ({ item, onSave, onClose }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [previewSrc, setPreviewSrc] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (item) {
            setTitle(item.title);
setDescription(item.description);
            setPreviewSrc(item.src);
        }
    }, [item]);

    if (!item) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreviewSrc(URL.createObjectURL(selectedFile));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        await onSave(item, { title, description, file });
        setIsSaving(false);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-button" onClick={onClose}>&times;</button>
                <h2>작품 수정</h2>
                <form onSubmit={handleSubmit} className="form-group">
                    <div className="form-group">
                        <label htmlFor="edit-title">제목</label>
                        <input id="edit-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="edit-description">설명</label>
                        <input id="edit-description" type="text" value={description} onChange={(e) => setDescription(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="edit-file">이미지/비디오 파일 (변경 시 선택)</label>
                        <input id="edit-file" type="file" onChange={handleFileChange} accept="image/*,video/*" />
                        {previewSrc && (item.type === 'image' || (file && file.type.startsWith('image')) 
                            ? <img src={previewSrc} alt="미리보기" className="media-preview" />
                            : <video src={previewSrc} controls className="media-preview" />
                        )}
                    </div>
                    <div className="form-group">
                        <button type="submit" disabled={isSaving}>{isSaving ? '저장 중...' : '저장'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// AdminDashboard: 관리자 대시보드
const AdminDashboard = ({ galleryItems, setGalleryItems, portfolioInfo, setPortfolioInfo, onLogout, setLoading }) => {
    const [uploadTitle, setUploadTitle] = useState('');
    const [uploadDescription, setUploadDescription] = useState('');
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [editingItem, setEditingItem] = useState(null);
    const [editedInfo, setEditedInfo] = useState(portfolioInfo);
    const [infoFiles, setInfoFiles] = useState<{ logo: File | null; profile: File | null }>({ logo: null, profile: null });
    
    useEffect(() => { setEditedInfo(portfolioInfo); }, [portfolioInfo]);

    // 파일 업로드 및 URL 반환 헬퍼 함수
    const uploadFileAndGetURL = async (file, path) => {
        const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
    };

    // 기존 파일 삭제 (URL 기반)
    const deleteFileByUrl = async (url) => {
        if (!url || !url.includes('firebasestorage.googleapis.com')) return;
        try {
            const fileRef = ref(storage, url);
            await deleteObject(fileRef);
        } catch (error) {
            // 파일이 존재하지 않는 등의 오류는 무시 (예: 기본 이미지)
            if (error.code !== 'storage/object-not-found') {
                 console.error("기존 파일 삭제 오류:", error);
            }
        }
    };


    const handleInfoFileChange = (e, field) => {
        const file = e.target.files[0];
        if (file) {
            setInfoFiles(prev => ({ ...prev, [field]: file }));
            setEditedInfo(prev => ({ ...prev, [`${field}Src`]: URL.createObjectURL(file) }));
        }
    };
    const handleInfoTextChange = (e, field) => setEditedInfo(prev => ({ ...prev, [field]: e.target.value }));

    // 홈페이지 정보 저장 (Firebase 연동)
    const handleInfoSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let updatedInfo = { ...editedInfo };

            if (infoFiles.logo) {
                await deleteFileByUrl(portfolioInfo.logoSrc); // 기존 로고 삭제
                updatedInfo.logoSrc = await uploadFileAndGetURL(infoFiles.logo, 'info');
            }
            if (infoFiles.profile) {
                await deleteFileByUrl(portfolioInfo.profilePicSrc); // 기존 프로필 사진 삭제
                updatedInfo.profilePicSrc = await uploadFileAndGetURL(infoFiles.profile, 'info');
            }
            
            // blob URL이 데이터베이스에 저장되는 것을 방지
            const finalInfo = {
                ...updatedInfo,
                logoSrc: updatedInfo.logoSrc.startsWith('blob:') ? portfolioInfo.logoSrc : updatedInfo.logoSrc,
                profilePicSrc: updatedInfo.profilePicSrc.startsWith('blob:') ? portfolioInfo.profilePicSrc : updatedInfo.profilePicSrc
            };

            const infoRef = doc(db, 'portfolio', 'info');
            await setDoc(infoRef, finalInfo);
            setPortfolioInfo(finalInfo);
            alert('홈페이지 정보가 저장되었습니다.');
        } catch (error) {
            console.error("정보 저장 오류:", error);
            alert('저장 중 오류가 발생했습니다.');
        }
        setLoading(false);
    };

    // 새 작품 업로드 (Firebase 연동)
    const handleUpload = async (e) => {
        e.preventDefault();
        if (!uploadFile || !uploadTitle || !uploadDescription) return alert('모든 필드를 채워주세요.');
        setLoading(true);
        try {
            const src = await uploadFileAndGetURL(uploadFile, 'gallery');
            const type = uploadFile.type.startsWith('video') ? 'video' : 'image';
            const newId = Date.now().toString();
            const newItem = { id: newId, type, src, title: uploadTitle, description: uploadDescription };
            
            await setDoc(doc(db, "gallery", newId), newItem);
            setGalleryItems(prev => [...prev, newItem]);

            setUploadTitle(''); setUploadDescription(''); setUploadFile(null); e.target.reset();
            alert('작품이 업로드되었습니다.');
        } catch (error) {
            console.error("업로드 오류:", error);
            alert('업로드 중 오류가 발생했습니다.');
        }
        setLoading(false);
    };

    // 작품 삭제 (Firebase 연동)
    const handleDelete = async (itemToDelete) => {
        if (!window.confirm('정말로 이 항목을 삭제하시겠습니까? 데이터베이스에서 영구적으로 삭제됩니다.')) return;
        setLoading(true);
        try {
            await deleteDoc(doc(db, "gallery", itemToDelete.id));
            await deleteFileByUrl(itemToDelete.src);
            
            setGalleryItems(prev => prev.filter(item => item.id !== itemToDelete.id));
            alert('작품이 삭제되었습니다.');
        } catch (error) {
            console.error("삭제 오류:", error);
            alert('삭제 중 오류가 발생했습니다.');
        }
        setLoading(false);
    };

    // 작품 수정 (Firebase 연동)
    const handleUpdate = async (originalItem, updatedData) => {
        setLoading(true);
        try {
            let { title, description, file } = updatedData;
            let src = originalItem.src;
            let type = originalItem.type;

            if (file) {
                src = await uploadFileAndGetURL(file, 'gallery');
                type = file.type.startsWith('video') ? 'video' : 'image';
                await deleteFileByUrl(originalItem.src); // 기존 파일 삭제
            }
            
            const updatedItem = { ...originalItem, title, description, src, type };
            await updateDoc(doc(db, "gallery", originalItem.id), { title, description, src, type });

            setGalleryItems(prev => prev.map(item => item.id === originalItem.id ? updatedItem : item));
            setEditingItem(null);
            alert('작품이 수정되었습니다.');
        } catch (error) {
            console.error("수정 오류:", error);
            alert('수정 중 오류가 발생했습니다.');
        }
        setLoading(false);
    };

    return (
        <>
            <div className="admin-dashboard container">
                <div className="admin-header"><h1>관리자 대시보드</h1><button onClick={onLogout}>로그아웃</button></div>
                <section className="admin-section">
                    <h2>홈페이지 정보 수정</h2>
                    <form className="form-group" onSubmit={handleInfoSubmit}>
                        <div className="form-group"><label htmlFor="logo-upload">로고 이미지</label><input type="file" id="logo-upload" onChange={e => handleInfoFileChange(e, 'logo')} accept="image/*" /><img src={editedInfo.logoSrc} alt="로고 미리보기" className="media-preview" style={{ background: '#f0f0f0' }}/></div>
                        <div className="form-group"><label htmlFor="profile-pic-upload">프로필 사진</label><input type="file" id="profile-pic-upload" onChange={e => handleInfoFileChange(e, 'profile')} accept="image/*" /><img src={editedInfo.profilePicSrc} alt="프로필 사진 미리보기" className="media-preview" /></div>
                        <div className="form-group"><label htmlFor="intro-text">자기소개</label><textarea id="intro-text" value={editedInfo.introText} onChange={e => handleInfoTextChange(e, 'introText')} /></div>
                        <div className="form-group"><label htmlFor="description-text">홈페이지 설명</label><textarea id="description-text" value={editedInfo.descriptionText} onChange={e => handleInfoTextChange(e, 'descriptionText')} /></div>
                        <button type="submit">홈페이지 정보 저장</button>
                    </form>
                </section>
                <section className="admin-section">
                    <h2>새 작품 업로드</h2>
                    <form className="upload-form form-group" onSubmit={handleUpload}>
                        <div className="form-group"><label htmlFor="title">제목</label><input type="text" id="title" value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} required /></div>
                        <div className="form-group"><label htmlFor="description">설명</label><input type="text" id="description" value={uploadDescription} onChange={e => setUploadDescription(e.target.value)} required /></div>
                        <div className="form-group"><label htmlFor="file">이미지/비디오 파일</label><input type="file" id="file" onChange={e => setUploadFile(e.target.files[0])} accept="image/*,video/*" required /></div>
                        <button type="submit">업로드</button>
                    </form>
                </section>
                <section className="admin-section">
                    <h2>작품 관리</h2>
                    <table className="manage-table">
                        <thead><tr><th style={{width: '20%'}}>ID(생성시간)</th><th style={{width: '40%'}}>제목</th><th style={{width: '15%'}}>타입</th><th style={{width: '25%'}}>관리</th></tr></thead>
                        <tbody>
                            {galleryItems.map(item => (
                                <tr key={item.id}><td>{item.id}</td><td>{item.title}</td><td>{item.type}</td><td>
                                    <button className="action-btn edit-btn" onClick={() => setEditingItem(item)}>수정</button>
                                    <button className="action-btn delete-btn" onClick={() => handleDelete(item)}>삭제</button>
                                </td></tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            </div>
            {editingItem && <EditItemModal item={editingItem} onSave={handleUpdate} onClose={() => setEditingItem(null)} />}
        </>
    );
};

// PortfolioView: 메인 포트폴리오 페이지 컴포넌트
const PortfolioView = ({ galleryItems, portfolioInfo, setAdminLoginVisible }) => {
    const [selectedItem, setSelectedItem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [displayItems, setDisplayItems] = useState(galleryItems);

    useEffect(() => {
        if (searchTerm.trim() === '') setDisplayItems(galleryItems);
    }, [galleryItems, searchTerm]);

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (value) {
            const filteredSuggestions = galleryItems.filter(item => item.title.toLowerCase().includes(value.toLowerCase()));
            setSuggestions(filteredSuggestions);
        } else {
            setSuggestions([]);
            setDisplayItems(galleryItems);
        }
    };
    
    const handleSearchSubmit = (value) => {
        setSearchTerm(value);
        setSuggestions([]);
        const lowercasedValue = value.toLowerCase();
        const filtered = galleryItems.filter(item => item.title.toLowerCase().includes(lowercasedValue) || item.description.toLowerCase().includes(lowercasedValue));
        setDisplayItems(filtered);
    };

    const handleKeyDown = (e) => { if (e.key === 'Enter') handleSearchSubmit(searchTerm); };

    const SearchIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>);
    const YouTubeIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><g fill="none" strokeWidth="1.5"><circle cx="12" cy="12" r="10" fill="#333"></circle><path d="M15.5 12L10 9.5V14.5L15.5 12Z" fill="white"></path></g></svg>);

    return (
        <>
            <div className="container">
                <header>
                    <div className="search-container">
                        <div className="search-bar"><SearchIcon /><input type="text" placeholder="검색" value={searchTerm} onChange={handleSearchChange} onKeyDown={handleKeyDown}/></div>
                        {suggestions.length > 0 && <ul className="autocomplete-suggestions">{suggestions.map(s => <li key={s.id} onClick={() => handleSearchSubmit(s.title)}>{s.title}</li>)}</ul>}
                    </div>
                    <div className="social-links">
                        <a href="https://youtube.com/@yoobakschool?si=dWoOWiRpCQzLOKdg" target="_blank" rel="noopener noreferrer"><YouTubeIcon /></a>
                        <a href="https://www.instagram.com/startup2000/" target="_blank" rel="noopener noreferrer">Instagram</a>
                    </div>
                </header>
                <section className="profile-section">
                    <div className="logo"><img src={portfolioInfo.logoSrc} alt="로고" /></div>
                    <img src={portfolioInfo.profilePicSrc} alt="프로필 사진" className="profile-pic" />
                    <div className="profile-intro">{portfolioInfo.introText}</div>
                </section>
                <section className="description-banner">{portfolioInfo.descriptionText}</section>
                <main className="gallery">
                    {displayItems.length > 0 ? displayItems.map(item => (
                        <div key={item.id} className="gallery-item" onClick={() => setSelectedItem(item)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setSelectedItem(item)}>
                            <div className="thumbnail">
                                {item.type === 'image' ? <img src={item.src} alt={item.title} loading="lazy" /> : <video src={item.src} muted loop playsInline />}
                            </div>
                            <p className="title">{item.title}</p>
                        </div>
                    )) : <p>{galleryItems.length === 0 ? "관리자 페이지에서 첫 작품을 업로드하세요." : "검색 결과가 없습니다."}</p>}
                </main>
            </div>
            <div className="footer-wrapper">
                 <footer>
                    <p>© 2025 YOOBACK SCHOOL. All Rights Reserved.</p>
                    <p>Contact startup2000@chosun.ac.kr</p>
                    <button className="admin-button" onClick={() => setAdminLoginVisible(true)}>Admin</button>
                </footer>
            </div>
            <Modal item={selectedItem} onClose={() => setSelectedItem(null)} />
        </>
    );
};

// App: 애플리케이션 최상위 컴포넌트
const App = () => {
    const [galleryItems, setGalleryItems] = useState([]);
    const [portfolioInfo, setPortfolioInfo] = useState({
        logoSrc: '', profilePicSrc: '', introText: '관리자 페이지에서 자기소개를 입력하세요.', descriptionText: '관리자 페이지에서 홈페이지 설명을 입력하세요.'
    });
    const [isAdmin, setIsAdmin] = useState(false);
    const [isAdminLoginVisible, setAdminLoginVisible] = useState(false);
    const [loading, setLoading] = useState(true); // 데이터 로딩 상태

    // 앱이 처음 시작될 때 Firebase에서 데이터를 가져오는 함수
    const fetchData = useCallback(async () => {
        if (!db) {
            console.error("Firebase is not initialized.");
            setLoading(false);
            return; 
        }
        try {
            const infoDoc = await getDoc(doc(db, "portfolio", "info"));
            if (infoDoc.exists()) setPortfolioInfo(infoDoc.data());

            const gallerySnapshot = await getDocs(collection(db, "gallery"));
            const items = gallerySnapshot.docs.map(doc => doc.data());
            setGalleryItems(items);
        } catch (error) {
            console.error("데이터 로딩 오류:", error);
            alert("데이터를 불러오는 중 오류가 발생했습니다. Firebase 보안 규칙을 확인하거나 인터넷 연결을 확인해주세요.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleLoginSuccess = () => { setIsAdmin(true); setAdminLoginVisible(false); };

    return (
        <>
            <AppStyles />
            <BackgroundAnimation />
            {loading && <div className="loading-overlay">데이터를 불러오는 중...</div>}
            
            {isAdmin ? (
                <AdminDashboard 
                    galleryItems={galleryItems} setGalleryItems={setGalleryItems} 
                    portfolioInfo={portfolioInfo} setPortfolioInfo={setPortfolioInfo}
                    onLogout={() => setIsAdmin(false)} setLoading={setLoading}
                />
            ) : (
                <PortfolioView 
                    galleryItems={galleryItems} portfolioInfo={portfolioInfo}
                    setAdminLoginVisible={setAdminLoginVisible}
                />
            )}

            {isAdminLoginVisible && (
                <AdminLoginModal 
                    onClose={() => setAdminLoginVisible(false)}
                    onLoginSuccess={handleLoginSuccess}
                />
            )}
        </>
    );
};

// React 앱 렌더링 시작점
const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);