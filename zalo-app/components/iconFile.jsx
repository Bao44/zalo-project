import React from 'react';
import { Image, StyleSheet } from 'react-native';

export const iconFile = (type) => {
    switch (type) {
        case 'application/pdf':
            return <Image style={styles.icon} source={require('../assets/images/iconFiles/2133056_document_eps_file_format_pdf_icon.png')} />;
        case 'application/msword':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            return <Image style={styles.icon} source={require('../assets/images/iconFiles/6296673_microsoft_office_office365_word_icon.png')} />;
        case 'application/vnd.ms-excel':
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
            return <Image style={styles.icon} source={require('../assets/images/iconFiles/6296676_excel_microsoft_office_office365_icon.png')} />;
        case 'application/vnd.ms-powerpoint':
        case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
            return <Image style={styles.icon} source={require('../assets/images/iconFiles/6296672_microsoft_office_office365_powerpoint_icon.png')} />;
        case 'application/zip':
        case 'application/x-rar-compressed':
        case 'application/vnd.rar':
            return <Image style={styles.icon} source={require('../assets/images/iconFiles/285629_zip_file_icon.png')} />;
        case 'application/json':
        case 'text/xml':
        case 'application/xml':
            return <Image style={styles.icon} source={require('../assets/images/iconFiles/211656_text_document_icon.png')} />;
        case 'text/plain':
        case 'text/html':
            return <Image style={styles.icon} source={require('../assets/images/iconFiles/9040382_filetype_html_icon.png')} />;
        case 'text/comma-separated-values':
        case 'text/csv':
            return <Image style={styles.icon} source={require('../assets/images/iconFiles/7267724_ext_csv_file_document_format_icon.png')} />;
        default:
            return <Image style={styles.icon} source={require('../assets/images/iconFiles/211656_text_document_icon.png')} />;
    }
};

const styles = StyleSheet.create({
    icon: {
        width: 30,
        height: 30,
    }
});