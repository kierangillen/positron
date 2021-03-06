import {
  FeatureArticle,
  StandardArticle,
} from "@artsy/reaction/dist/Components/Publishing/Fixtures/Articles"
import Backbone from "backbone"
import { mount } from "enzyme"
import React from "react"
import { Autocomplete, AutocompleteResult } from "../index"
require("typeahead.js")

describe("Autocomplete", () => {
  let props
  let searchResults

  beforeEach(() => {
    props = {
      items: [],
      onSelect: jest.fn(),
      placeholder: "Search by title",
      url: "artsy.net",
    }

    searchResults = [FeatureArticle, StandardArticle]
  })

  it("Renders an input with placeholder", () => {
    const component = mount(<Autocomplete {...props} />)
    expect(component.find("input").length).toBe(1)
    expect(component.html()).toMatch(props.placeholder)
  })

  it("Sets up Bloodhound", () => {
    const component = mount(
      <Autocomplete {...props} />
    ).instance() as Autocomplete
    expect(component.engine.remote.url).toBe(props.url)
  })

  it("Searches with Bloodhound on input", () => {
    const component = mount(<Autocomplete {...props} />)
    const instance = component.instance() as Autocomplete
    instance.engine.get = jest.fn()
    instance.search("a title")
    expect(instance.engine.get.mock.calls[0][0]).toBe("a title")
  })

  it("OnSelect calls props.onSelect with selected id", async () => {
    const component = mount(
      <Autocomplete {...props} />
    ).instance() as Autocomplete
    await component.onSelect(searchResults[0])
    expect(props.onSelect.mock.calls[0][0][0]).toBe(searchResults[0].id)
  })

  it("Returns a custom formatted selection on select if provided", async () => {
    Backbone.sync = jest.fn(() => {
      return new Backbone.Model(searchResults[0])
    })

    const formatSelected = async item => {
      const article = new Backbone.Model(item)
      return article.fetch()
    }
    props.formatSelected = formatSelected

    const component = mount(
      <Autocomplete {...props} />
    ).instance() as Autocomplete
    await component.onSelect(searchResults[0])
    expect(props.onSelect.mock.calls[0][0][0].get("id")).toBe(
      searchResults[0].id
    )
  })

  it("Returns an error if formatSelected errors", async () => {
    Backbone.sync = jest.fn(() => {
      const err = { message: "an error" }
      return err
    })

    const formatSelected = item => {
      const article = new Backbone.Model(item)
      return article.fetch()
    }
    props.formatSelected = formatSelected

    const component = mount(
      <Autocomplete {...props} />
    ).instance() as Autocomplete
    await component.onSelect(searchResults[0])
    expect(props.onSelect.mock.calls[0][0][0].message).toBe("an error")
  })

  it("Disables input if props.disabled", () => {
    props.disabled = true
    const component = mount(<Autocomplete {...props} />)
    const input = component.find("input").at(0)
    expect(input.props().disabled).toBe(true)
  })

  it("Uses a custom filter on results if provided", () => {
    const filter = items => {
      return items.results.map(item => {
        return {
          _id: item.id,
          title: item.title,
          slug: item.slug,
        }
      })
    }

    props.filter = filter
    const component = mount(
      <Autocomplete {...props} />
    ).instance() as Autocomplete
    expect(component.engine.remote.filter).toBe(props.filter)
    expect(
      component.engine.remote.filter({ results: searchResults })[0].slug
    ).toBe(searchResults[0].slug)
  })

  it("Displays a list of results if present", () => {
    const component = mount(<Autocomplete {...props} />)
    component.state().hasFocus = jest.fn().mockReturnValue(true)
    component.setState({ searchResults })
    expect(component.find(AutocompleteResult).length).toBe(searchResults.length)
    expect(component.html()).toMatch(searchResults[0].title)
  })

  it('Displays "No Results" if focused and no results', () => {
    const component = mount(<Autocomplete {...props} />)
    component.state().hasFocus = jest.fn().mockReturnValue(true)
    component.setState({ searchResults: [] })
    expect(component.find(AutocompleteResult).length).toBe(1)
    expect(component.html()).toMatch("No results")
  })

  it("Uses a custom format for results if provided", () => {
    const formatSearchResult = item => {
      return <div>Child: {item.title}</div>
    }
    props.formatSearchResult = formatSearchResult
    const component = mount(<Autocomplete {...props} />)
    component.state().hasFocus = jest.fn().mockReturnValue(true)
    component.setState({ searchResults })
    expect(component.text()).toMatch(`Child: ${searchResults[0].title}`)
  })
})
