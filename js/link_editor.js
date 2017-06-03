this.LinkEditor = (function() {
  function LinkEditor() {}

  LinkEditor.editing = false;

  LinkEditor.registerEvents = function() {
    $('#edit-editmode').click(function() {
      return LinkEditor.toggleEditMode();
    });
    $('#edit-add').click(function() {
      return LinkEditor.addEmptyCategory();
    });
    $('#edit-raw-data').click(function() {
      return LinkEditor.openRawEditor();
    });
    $(document).on('click', '.category-remove-btn', function() {
      return LinkEditor.removeCategory(LinkEditor.getCategoryID($(this)));
    });
    $(document).on('click', '.category-edit-btn', function() {
      return LinkEditor.toggleEditingCategory(LinkEditor.getContainingCategory(this));
    });
    $(document).on('click', '.category-add-item-btn', function() {
      var catID;
      catID = LinkEditor.getCategoryID($(this));
      return LinkEditor.addEntry(catID);
    });
    $(document).on('click', '.entry-edit-btn', function() {
      return LinkEditor.editEntry($(this));
    });
    $(document).on('click', '.entry-remove-btn', function() {
      return LinkEditor.removeEntry($(this));
    });
    $(document).on('confirmation', '.remodal', function() {
      var categoryID, entryID;
      var modalForm = document.querySelector("#entry-edit-form");
      entryID = parseInt(modalForm["entry_id"].value);
      categoryID = parseInt(modalForm["category_id"].value);
      Links.contents[categoryID].entries[entryID] = {
        title: modalForm["entry_title"].value,
        href: modalForm["entry_href"].value
      };
      Links.saveToLocalStorage();
      return Links.render();
    });
    $(document).on('click', '.colorpicker-color', function() {
      return LinkEditor.updateCategoryColor($(this));
    });
    $('#raw-data-cancel').click(function() {
      return LinkEditor.closeRawEditor();
    });
    return $('#raw-data-save').click(function() {
      return LinkEditor.saveRawEditor();
    });
  };

  LinkEditor.addEmptyCategory = function() {
    LinkEditor.saveCurrentlyEditing();
    Links.contents.push({
      name: "New Category",
      color: "#2c3e50",
      entries: []
    });
    return LinkEditor.updateLinks();
  };

  LinkEditor.toggleEditingCategory = function(category) {
    if (!category.classList.contains('editing')) {
      category.classList.add('editing');
      return LinkEditor.editCategory(category);
    } else {
      category.classList.remove('editing');
      return LinkEditor.stopEditCategory(category);
    }
  };

  LinkEditor.editCategory = function(category) {
    var title, titleElement;
    titleElement = category.querySelector('.title');
    titleElement.contentEditable = "true";
  };

  LinkEditor.stopEditCategory = function(category) {
    category.querySelector(".title").contentEditable = "false";
    return LinkEditor.updateSavedCategory(category);
  };

  LinkEditor.updateSavedCategory = function(category) {
    var saved = Links.contents[LinkEditor.getCategoryID(category)];
    saved.name = category.querySelector('.title').innerText;
    Links.saveToLocalStorage();
    return saved.name;
  };

  LinkEditor.removeCategory = function(id) {
    LinkEditor.saveCurrentlyEditing();
    if(!confirm("Supprimer la catégorie "+Links.contents[id].name+" ?"))
      return;
    Links.contents.splice(id, 1);
    return LinkEditor.updateLinks();
  };

  LinkEditor.updateCategoryColor = function(clickedColorPickerColor) {
    var catID;
    catID = LinkEditor.getCategoryID(clickedColorPickerColor);
    Links.contents[catID].color = clickedColorPickerColor.attr('data-color');
    LinkEditor.saveCurrentlyEditing();
    return Links.render();
  };

  LinkEditor.editEntry = function(entry) {
    var entryID, modelEntry;
    entryID = LinkEditor.getEntryID(entry);
    $('#entry-editor-entry-id').val(entryID);
    $('#entry-editor-category-id').val(LinkEditor.getCategoryID(entry));
    modelEntry = Links.contents[LinkEditor.getCategoryID(entry)].entries[entryID];
    $('#entry-edit-title').val(modelEntry.title);
    $('#entry-edit-href').val(modelEntry.href);
    return location.hash = "edit-entry";
  };

  LinkEditor.addEntry = function(categoryID) {
    var entry;
    Links.contents[categoryID].entries.push({
      title: '',
      href: 'http://'
    });
    Links.render();
    entry = $('.category[data-category-index="' + categoryID + '"] > .entries > .entry:last-of-type');
    return LinkEditor.editEntry(entry);
  };

  LinkEditor.removeEntry = function(entry) {
    var title = Links.contents[LinkEditor.getCategoryID(entry)].entries[LinkEditor.getEntryID(entry)]["title"]
    if(!confirm("Supprimer le lien "+title+" ?"))
      return;
    Links.contents[LinkEditor.getCategoryID(entry)].entries.splice(LinkEditor.getEntryID(entry), 1);
    Links.saveToLocalStorage();
    return Links.render();
  };

  LinkEditor.updateLinks = function() {
    return Links.render();
  };

  LinkEditor.getCategoryID = function(element) {
    if(element.dataset){
      //dealing with real HTMLElement
      return parseInt(element.dataset.categoryIndex)
    }
    //fallback in case there are still calls with jquery objects
    return parseInt(LinkEditor.getContainingCategory(element).attr('data-category-index'));
  };

  LinkEditor.getContainingCategory = function(element) {
    return element.closest('.category');
  };

  LinkEditor.getEntryID = function(element) {
    return parseInt(LinkEditor.getContainingEntry(element).attr('data-entry-index'));
  };

  LinkEditor.getContainingEntry = function(element) {
    return element.closest('.entry');
  };

  LinkEditor.saveCurrentlyEditing = function() {
    document.querySelectorAll('.category.editing').forEach(function(cat) {
      return LinkEditor.stopEditCategory(cat);
    });
  };

  LinkEditor.openRawEditor = function() {
    LinkEditor.saveCurrentlyEditing();
    $('#raw-data-box').val(JSON.stringify(Links.contents, null, "    "));
    return $('#raw-data-editor').addClass('editing');
  };

  LinkEditor.closeRawEditor = function() {
    return $('#raw-data-editor').removeClass('editing');
  };

  LinkEditor.saveRawEditor = function() {
    var code, data, e;
    try {
      code = $('#raw-data-box').val();
      if (!code || /^\s*$/.test(code)) {
        Links.contents = [];
      } else {
        data = JSON.parse(code);
        if (data instanceof Array) {
          Links.contents = data;
        } else {
          throw "No array given";
        }
      }
      Links.render();
      return LinkEditor.closeRawEditor();
    } catch (_error) {
      e = _error;
      return alert('Please check the format of the data you entered.');
    }
  };

  LinkEditor.toggleEditMode = function() {
    LinkEditor.editing = !LinkEditor.editing;
    if (LinkEditor.editing) {
      $('#editbar').addClass('editing');
      return $('#link-view').addClass('editing');
    } else {
      LinkEditor.saveCurrentlyEditing();
      $('.editing').removeClass('editing');
      return Links.saveToLocalStorage();
    }
  };

  return LinkEditor;

})();

$(document).ready(function() {
  return LinkEditor.registerEvents();
});
