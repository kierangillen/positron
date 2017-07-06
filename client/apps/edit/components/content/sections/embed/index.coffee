#
# Embed section for supporting external content via iframes
#

_ = require 'underscore'
React = require 'react'
sd = require('sharify').data
SectionControls = React.createFactory require '../../section_controls/index.coffee'
{ div, section, label, nav, input, a, h1, p, strong, span, form, button, iframe } = React.DOM

module.exports = React.createClass
  displayName: 'SectionEmbed'

  getInitialState: ->
    errorMessage: ''
    url: @props.section.get('url')
    height: @props.section.get('height')
    mobile_height: @props.section.get('mobile_height')
    layout: @props.section.get('layout') or 'column_width'

  componentDidMount: ->
    url = @props.section.get('url')
    height = @props.section.get('height') or ''
    @updateIframe url, height if url

  onClickOff: ->
    return @props.section.destroy() if @state.url is ''

  submitUrl: (e) ->
    e.preventDefault()
    url = @refs.url.value
    height = @refs.height.value
    mobileHeight = @refs.mobileHeight.value
    @props.section.set url: url, height: height, mobile_height: mobileHeight
    @setState loading: true
    @updateIframe url, height

  updateIframe: (url, height = '') ->
    @setState url: url, height: height
    @forceUpdate()
    @setState loading: false

  changeLayout: (layout) -> =>
    @props.section.set layout: layout
    @updateIframe(@state.url, @state.height)

  getWidth: ->
    if @props.section.get('layout') is 'overflow' then 1060 else 500

  render: ->
    section {
      className: 'edit-section-embed-container'
      onClick: @props.setEditing(on)
    },
      if @props.editing
        SectionControls {
          section: @props.section
          channel: @props.channel
        },
          nav { className: 'es-layout' },
            a {
              name: 'overflow_fillwidth'
              className: 'layout'
              onClick: @changeLayout('overflow')
              'data-active': @props.section.get('layout') is 'overflow'
            }
            a {
              name: 'column_width'
              className: 'layout'
              onClick: @changeLayout('column_width')
              'data-active': @props.section.get('layout') is 'column_width'
            }
          section { className: 'ese-inputs' },
            div {
              className: 'ese-iframe-error'
              dangerouslySetInnerHTML: __html: @state.errorMessage
            }
            form {
              className: 'ese-input-form-container'
              onSubmit: @submitUrl
            },
              div { className: 'ese-input' }, "URL",
                input {
                  placeholder: 'https://files.artsy.net'
                  className: 'bordered-input bordered-input-dark'
                  ref: 'url'
                  defaultValue: @props.section.get('url')
                },
              div { className: 'ese-input ese-input-height' }, "Height (optional)",
                input {
                  placeholder: '400'
                  className: 'bordered-input bordered-input-dark'
                  ref: 'height'
                  defaultValue: @props.section.get('height')
                }
              div { className: 'ese-input ese-input-height' }, "Mobile Height (optional)",
                input {
                  placeholder: '300'
                  className: 'bordered-input bordered-input-dark'
                  ref: 'mobileHeight'
                  defaultValue: @props.section.get('mobile_height')
              }
              button {
                className: 'avant-garde-button avant-garde-button-dark'
                'data-state': if @state.loading then 'loading' else ''
              }, 'Add URL'
      div {
        className: 'embed-container'
        ref: 'embed'
      }
        (if @state.url is ''
          div { className: 'ese-empty-placeholder' }, 'Add URL above'
        else
          div {
            className: 'ese-embed-content'
          },
            iframe {
              src: @state.url
              className: 'embed-iframe'
              scrolling: 'no'
              frameBorder: '0'
              style: { 'height': @state.height if @state.height?.length }
            }
        )
