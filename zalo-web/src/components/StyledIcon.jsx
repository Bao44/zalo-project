import { styled } from '@mui/material/styles';

// Nhập các hình ảnh từ thư mục assets
import PdfIcon from '../assets/images/iconFiles/2133056_document_eps_file_format_pdf_icon.png';
import WordIcon from '../assets/images/iconFiles/6296673_microsoft_office_office365_word_icon.png';
import ExcelIcon from '../assets/images/iconFiles/6296676_excel_microsoft_office_office365_icon.png';
import PowerPointIcon from '../assets/images/iconFiles/6296672_microsoft_office_office365_powerpoint_icon.png';
import ZipIcon from '../assets/images/iconFiles/285629_zip_file_icon.png';
import JsonXmlIcon from '../assets/images/iconFiles/211656_text_document_icon.png';
import HtmlIcon from '../assets/images/iconFiles/9040382_filetype_html_icon.png';
import CsvIcon from '../assets/images/iconFiles/7267724_ext_csv_file_document_format_icon.png';

// Định dạng kiểu dáng bằng styled API của MUI
const StyledIcon = styled('img')(() => ({
    width: 50,
    height: 50,
    objectFit: 'contain', // Đảm bảo hình ảnh không bị méo
}));

// Component trả về biểu tượng tương ứng với MIME type
import PropTypes from 'prop-types';

export const IconFile = ({ type }) => {
    switch (type) {
        case 'application/pdf':
            return <StyledIcon src={PdfIcon} alt="PDF Icon" />;
        case 'application/msword':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            return <StyledIcon src={WordIcon} alt="Word Icon" />;
        case 'application/vnd.ms-excel':
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
            return <StyledIcon src={ExcelIcon} alt="Excel Icon" />;
        case 'application/vnd.ms-powerpoint':
        case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
            return <StyledIcon src={PowerPointIcon} alt="PowerPoint Icon" />;
        case 'application/zip':
        case 'application/x-rar-compressed':
        case 'application/vnd.rar':
            return <StyledIcon src={ZipIcon} alt="Zip Icon" />;
        case 'application/json':
        case 'text/xml':
        case 'application/xml':
            return <StyledIcon src={JsonXmlIcon} alt="JSON/XML Icon" />;
        case 'text/plain':
        case 'text/html':
            return <StyledIcon src={HtmlIcon} alt="HTML Icon" />;
        case 'text/comma-separated-values':
        case 'text/csv':
            return <StyledIcon src={CsvIcon} alt="CSV Icon" />;
    }
};

IconFile.propTypes = {
    type: PropTypes.string.isRequired,
};