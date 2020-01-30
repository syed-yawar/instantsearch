import React, { Component, Children } from 'react';
import isEqual from 'fast-deep-equal';
import PropTypes from 'prop-types';
import createInstantSearchManager from '../core/createInstantSearchManager';
import { InstantSearchProvider, InstantSearchContext } from '../core/context';
import { Store } from '../core/createStore';
import { PlainSearchParameters, SearchParameters } from 'algoliasearch-helper';
import { MultiResponse } from '../types/algoliasearch';

type ResultsState = {
  state: PlainSearchParameters;
  rawResults: MultiResponse;
};

// @TODO: move to createInstantSearchManager when it's TS
type InstantSearchManager = {
  store: Store;
  widgetsManager: any;
  getWidgetsIds: any;
  getSearchParameters: (
    ...args: any[]
  ) => {
    mainParameters: SearchParameters;
    derivedParameters: SearchParameters;
  };
  onSearchForFacetValues: (...args: any[]) => any;
  onExternalStateUpdate: (...args: any[]) => any;
  transitionState: any;
  updateClient: any;
  updateIndex: any;
  clearCache: () => void;
  skipSearch: any;
};

type SearchClient = {
  search: (requests: Array<{}>) => Promise<{}>;
  searchForFacetValues: (requests: Array<{}>) => Promise<{}>;
};

type SearchState = any;

type Props = {
  refresh: boolean;
  indexName: string;
  searchClient: SearchClient;
  createURL?: (searchState: SearchState, knownKeys: any) => string;
  onSearchStateChange?: (searchState: SearchState) => void;
  searchState?: SearchState;
  onSearchParameters?: (
    getSearchParameters: (...args: any) => any,
    context: any,
    props: any,
    searchState: SearchState
  ) => void;
  stalledSearchDelay?: number;
  resultsState: ResultsState | { [indexId: string]: ResultsState };
};

type State = {
  isControlled: boolean;
  instantSearchManager: InstantSearchManager;
  contextValue: InstantSearchContext;
};

function isControlled(props: Props) {
  return Boolean(props.searchState);
}

/**
 * @description
 * `<InstantSearch>` is the root component of all React InstantSearch implementations.
 * It provides all the connected components (aka widgets) a means to interact
 * with the searchState.
 * @kind widget
 * @name <InstantSearch>
 * @requirements You will need to have an Algolia account to be able to use this widget.
 * [Create one now](https://www.algolia.com/users/sign_up).
 * @propType {string} indexName - Main index in which to search.
 * @propType {boolean} [refresh=false] - Flag to activate when the cache needs to be cleared so that the front-end is updated when a change occurs in the index.
 * @propType {object} [searchClient] - Provide a custom search client.
 * @propType {func} [onSearchStateChange] - Function to be called everytime a new search is done. Useful for [URL Routing](guide/Routing.html).
 * @propType {object} [searchState] - Object to inject some search state. Switches the InstantSearch component in controlled mode. Useful for [URL Routing](guide/Routing.html).
 * @propType {func} [createURL] - Function to call when creating links, useful for [URL Routing](guide/Routing.html).
 * @propType {SearchResults|SearchResults[]} [resultsState] - Use this to inject the results that will be used at first rendering. Those results are found by using the `findResultsState` function. Useful for [Server Side Rendering](guide/Server-side_rendering.html).
 * @propType {number} [stalledSearchDelay=200] - The amount of time before considering that the search takes too much time. The time is expressed in milliseconds.
 * @propType {{ Root: string|function, props: object }} [root] - Use this to customize the root element. Default value: `{ Root: 'div' }`
 * @example
 * import React from 'react';
 * import algoliasearch from 'algoliasearch/lite';
 * import { InstantSearch, SearchBox, Hits } from 'react-instantsearch-dom';
 *
 * const searchClient = algoliasearch(
 *   'latency',
 *   '6be0576ff61c053d5f9a3225e2a90f76'
 * );
 *
 * const App = () => (
 *   <InstantSearch
 *     searchClient={searchClient}
 *     indexName="instant_search"
 *   >
 *     <SearchBox />
 *     <Hits />
 *   </InstantSearch>
 * );
 */
class InstantSearch extends Component<Props, State> {
  static defaultProps = {
    stalledSearchDelay: 200,
    refresh: false,
  };

  static propTypes = {
    // @TODO: These props are currently constant.
    indexName: PropTypes.string.isRequired,

    searchClient: PropTypes.shape({
      search: PropTypes.func.isRequired,
      searchForFacetValues: PropTypes.func,
      addAlgoliaAgent: PropTypes.func,
      clearCache: PropTypes.func,
    }).isRequired,

    createURL: PropTypes.func,

    refresh: PropTypes.bool,

    searchState: PropTypes.object,
    onSearchStateChange: PropTypes.func,

    onSearchParameters: PropTypes.func,
    resultsState: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),

    children: PropTypes.node,
    stalledSearchDelay: PropTypes.number,
  };

  static getDerivedStateFromProps(
    nextProps: Props,
    prevState: State
  ): Partial<State> {
    const nextIsControlled = isControlled(nextProps);
    const previousSearchState = prevState.instantSearchManager.store.getState()
      .widgets;
    const nextSearchState = nextProps.searchState;

    if (nextIsControlled && !isEqual(previousSearchState, nextSearchState)) {
      prevState.instantSearchManager.onExternalStateUpdate(
        nextProps.searchState
      );
    }

    return {
      isControlled: nextIsControlled,
      contextValue: {
        ...prevState.contextValue,
        mainTargetedIndex: nextProps.indexName,
      },
    };
  }

  isUnmounting: boolean = false;

  constructor(props: Props) {
    super(props);

    const instantSearchManager = createInstantSearchManager({
      indexName: this.props.indexName,
      searchClient: this.props.searchClient,
      initialState: this.props.searchState || {},
      resultsState: this.props.resultsState,
      stalledSearchDelay: this.props.stalledSearchDelay,
    });

    const contextValue = {
      store: instantSearchManager.store,
      widgetsManager: instantSearchManager.widgetsManager,
      mainTargetedIndex: this.props.indexName,
      onInternalStateUpdate: this.onWidgetsInternalStateUpdate.bind(this),
      createHrefForState: this.createHrefForState.bind(this),
      onSearchForFacetValues: this.onSearchForFacetValues.bind(this),
      onSearchStateChange: this.onSearchStateChange.bind(this),
      onSearchParameters: this.onSearchParameters.bind(this),
    };

    this.state = {
      isControlled: isControlled(this.props),
      instantSearchManager,
      contextValue,
    };
  }

  componentDidUpdate(prevProps: Props) {
    const prevIsControlled = isControlled(prevProps);

    if (prevIsControlled && !this.state.isControlled) {
      throw new Error(
        "You can't switch <InstantSearch> from being controlled to uncontrolled"
      );
    }

    if (!prevIsControlled && this.state.isControlled) {
      throw new Error(
        "You can't switch <InstantSearch> from being uncontrolled to controlled"
      );
    }

    if (this.props.refresh !== prevProps.refresh && this.props.refresh) {
      this.state.instantSearchManager.clearCache();
    }

    if (prevProps.indexName !== this.props.indexName) {
      this.state.instantSearchManager.updateIndex(this.props.indexName);
    }

    if (prevProps.searchClient !== this.props.searchClient) {
      this.state.instantSearchManager.updateClient(this.props.searchClient);
    }
  }

  componentWillUnmount() {
    this.isUnmounting = true;
    this.state.instantSearchManager.skipSearch();
  }

  createHrefForState(searchState: SearchState) {
    searchState = this.state.instantSearchManager.transitionState(searchState);
    return this.state.isControlled && this.props.createURL
      ? this.props.createURL(searchState, this.getKnownKeys())
      : '#';
  }

  onWidgetsInternalStateUpdate(searchState: SearchState) {
    searchState = this.state.instantSearchManager.transitionState(searchState);

    this.onSearchStateChange(searchState);

    if (!this.state.isControlled) {
      this.state.instantSearchManager.onExternalStateUpdate(searchState);
    }
  }

  onSearchStateChange(searchState) {
    if (this.props.onSearchStateChange && !this.isUnmounting) {
      this.props.onSearchStateChange(searchState);
    }
  }

  onSearchParameters(getSearchParameters, context, props) {
    if (this.props.onSearchParameters) {
      const searchState = this.props.searchState ? this.props.searchState : {};
      this.props.onSearchParameters(
        getSearchParameters,
        context,
        props,
        searchState
      );
    }
  }

  onSearchForFacetValues(searchState) {
    this.state.instantSearchManager.onSearchForFacetValues(searchState);
  }

  getKnownKeys() {
    return this.state.instantSearchManager.getWidgetsIds();
  }

  render() {
    if (Children.count(this.props.children) === 0) {
      return null;
    }

    return (
      <InstantSearchProvider value={this.state.contextValue}>
        {this.props.children}
      </InstantSearchProvider>
    );
  }
}

export default InstantSearch;