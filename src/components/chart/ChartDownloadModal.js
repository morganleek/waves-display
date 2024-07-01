import React from "react";
import { useFormik } from 'formik';
const classNames = require('classnames');

export const ChartDownloadModal = ( { close, download, downloadEnabled, downloadRequiresDetails, title, license, buoyId } ) => {
  // console.log( downloadEnabled ? 'true' : 'false' );
  // console.log( typeof( downloadEnabled ) );
  const downloadForm = ( downloadRequiresDetails ) ? <ChartDownloadUserForm download={ download } buoyId={ buoyId }></ChartDownloadUserForm> : '';
  return (
    <div className={ classNames( 'modal', 'fade', 'show' ) } id="chartModal" tabindex="-1" aria-labelledby="chartModalLabel" >
      <div className={ classNames( 'modal-dialog' ) }>
        <div className={ classNames( 'modal-content' ) }>
          <div className={ classNames( 'modal-header' ) }>
            <h6 className={ classNames( 'modal-title' ) } id="chartModalLabel">{ title }</h6>
            <button type="button" className={ classNames( ['btn-close', 'fa', 'fa-close'] ) } aria-label="Close" onClick={ close } ></button>
          </div>
          <div className={ classNames( 'modal-body' ) }>
            <p>{ license }</p>
            { downloadEnabled ? downloadForm : undefined }
          </div>
          <div className={ classNames( 'modal-footer' ) }>
            <div className="btn-group">
              <button type="button" className={ classNames( 'btn' , 'btn-secondary', 'btn-cancel' ) } onClick={ close } >Close</button>
              { 
                downloadEnabled && !downloadRequiresDetails
                  ? <button 
                      type="button" 
                      className={ classNames( 'btn', 'btn-primary', 'btn-download' ) } 
                      onClick={ download } >
                      Download
                    </button> 
                  : undefined 
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  ) 
};

export const ChartDownloadUserForm = ( { download, buoyId } ) => {
  const required = [
    'country',
    'howWillYou'
  ];
  const formik = useFormik({
    initialValues: {
      fullName: '', 
      company: '', 
      state: '',
      country: '',
      howWillYou: '', 
      howWillYouOther: '',
      howDidYou: '',
      howDidYouOther: ''
    },
    validate: ( values ) => {
      const errors = {};

      // No empty fields allowed
      for( const value in values ) {
        // Check value is in required object
        if( required.indexOf( value ) >= 0 ) {
          // Is required
          if( !values[value] && value.indexOf('Other') == -1 ) {
            errors[value] = "Required";
          }
        }
      }

      return errors;
    },
    onSubmit: ( values, { setSubmitting } ) => {
      // Don't submit form
      setSubmitting( false );
      
      // Send form data
      const form_data = JSON.stringify( values, null, 2 );
      const init = {
        method: 'POST'
      }
      fetch( wad.ajax + "?action=waf_collect_user_data&buoy_id=" + buoyId + "&nonce=" + wad.user_data_nonce + "&form_data=" + form_data, init ) 
        .then( response => {
          if( !response.ok ) throw Error( response.statusText );
        } );
      
      // Trigger download
      download();

    },
  });

  return (
    <form id="chart-download-user-form" className="form-vertical" onSubmit={formik.handleSubmit}>
      <div className="form-group">
        <label htmlFor="fullName">Full Name</label>
        <input 
          type="text"
          className="form-control"
          name="fullName"
          onChange={ formik.handleChange }
          value={ formik.values.fullName } />
        { formik.touched.fullName && formik.errors.fullName ? <div className="has-errors">{ formik.errors.fullName }</div> : null }
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="company">Company</label>
        <input 
          type="text"
          className="form-control"
          name="company"
          onChange={ formik.handleChange }
          value={ formik.values.company } />
        { formik.touched.company && formik.errors.company ? <div className="has-errors">{ formik.errors.company }</div> : null }
      </div>
      <div className="form-group">
        <label htmlFor="state">State/Provence</label>
        <input 
          type="text"
          className="form-control"
          name="state"
          onChange={ formik.handleChange }
          value={ formik.values.state } />
        { formik.touched.state && formik.errors.state ? <div className="has-errors">{ formik.errors.state }</div> : null }
      </div>
      <div className="form-group">
        <label htmlFor="country">Country *</label>
        <input 
          type="text"
          className="form-control"
          name="country"
          onChange={ formik.handleChange }
          value={ formik.values.country } />
        { formik.touched.country && formik.errors.country ? <div className="has-errors">{ formik.errors.country }</div> : null }
      </div>
      <div className="form-group">
        <label htmlFor="howWillYou">How will you use the data: *</label>
        <select 
          className="form-select" 
          name="howWillYou" 
          onChange={ formik.handleChange }
          >
          <option>&nbsp;</option>
          <option value="research">Research </option>
          <option value="education">Education </option>
          <option value="government">Government </option>
          <option value="recreation">Recreation </option>
          <option value="navigation">Navigation </option>
          <option value="other">Other (specify)</option>
        </select>
        { formik.touched.howWillYou && formik.errors.howWillYou ? <div className="has-errors">{ formik.errors.howWillYou }</div> : null }
        { formik.values.howWillYou == "other" ? ( 
          <input 
            type="text"
            className="form-control"
            name="howWillYouOther"
            onChange={ formik.handleChange }
            placeholder="Please specify"
            value={ formik.values.howWillYouOther } />
        ) : null }
      </div>
      {/* <div className="form-group">
        <label htmlFor="howWillYouCheckbox">Let us know where this data will be used: *</label>
        <input 
          type="checkbox"
          name="howWillYouCheckbox[government]"
          value="1"
        /> Government <br />
        <input 
          type="checkbox"
          name="howWillYouCheckbox[research-education]"
          value="1"
        /> Research/Education <br />
        <input 
          type="checkbox"
          name="howWillYouCheckbox[commercial-industry]"
          value="1"
        /> Commercial/Industry <br />
        <input 
          type="checkbox"
          name="howWillYouCheckbox[recreation]"
          value="1"
        /> Recreation
      </div> */}
      <div className="form-group">
        <label htmlFor="howDidYou">How did you hear about us: *</label>
        <select 
          className="form-select" 
          name="howDidYou"
          onChange={ formik.handleChange }
          >
          <option>&nbsp;</option>
          <option value="social-media">Social media</option>
          <option value="web">Web search</option>
          <option value="news">News</option>
          <option value="email">Email</option>
          <option value="word">Word of mouth</option>
          <option value="other">Other (specify)</option>
        </select>
        { formik.touched.howDidYou && formik.errors.howDidYou ? <div className="has-errors">{ formik.errors.howDidYou }</div> : null }
        { formik.values.howDidYou == "other" ? (
          <input 
            type="text"
            className="form-control"
            name="howDidYouOther"
            onChange={ formik.handleChange }
            placeholder="Please specify"
            value={ formik.values.howDidYouOther } />
        ) : null }
      </div>
      <div className="btn-group">
        <button type="submit" className="btn btn-primary">Download</button>
      </div>
    </form>
  )
};