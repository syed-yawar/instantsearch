---
title: CurrentRefinements
type: widget
html: |
  <div class="ais-CurrentRefinements">
    <div class="ais-CurrentRefinements-header ais-header">
      Current refinements
    </div>
    <div class="ais-CurrentRefinements-body ais-body">
      <ul class="ais-CurrentRefinements-list">
        <li class="ais-CurrentRefinements-item">
          <button class="ais-CurrentRefinements-button">
            <span class="ais-CurrentRefinements-label">Movies & TV Shows</span>
            <span class="ais-CurrentRefinements-count">1,574</span>
            <span class="ais-CurrentRefinements-delete">✕</span>
          </button>
        </li>
        <li class="ais-CurrentRefinements-item">
          <button class="ais-CurrentRefinements-button">
            <span class="ais-CurrentRefinements-label">Others</span>
            <span class="ais-CurrentRefinements-count">2,450</span>
            <span class="ais-CurrentRefinements-delete">✕</span>
          </button>
        </li>
      </ul>
      <button class="ais-CurrentRefinements-reset">
        Clear all
      </button>
    </div>
    <div class="ais-CurrentRefinements-footer ais-footer">
      Footer info
    </div>
  </div>
classes:
  - name: .ais-CurrentRefinements
    description: the root div of the widget
  - name: .ais-CurrentRefinements-header
    description: the header of the widget (optional)
  - name: .ais-CurrentRefinements-body
    description: the body of the widget
  - name: .ais-CurrentRefinements-list
    description: the list of all refined items
  - name: .ais-CurrentRefinements-item
    description: the refined list item
  - name: .ais-CurrentRefinements-button
    description: the button of each refined list item
  - name: .ais-CurrentRefinements-label
    description: the refined list label
  - name: .ais-CurrentRefinements-count
    description: the count of refined values for each item
  - name: .ais-CurrentRefinements-delete
    description: the delete button of each label
  - name: .ais-CurrentRefinements-reset
    description: the reset button for current selected values
  - name: .ais-CurrentRefinements-footer
    description: the footer of the widget (optional)
---